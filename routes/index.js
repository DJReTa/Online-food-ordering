var express = require('express');
var router = express.Router();
const geolib = require('geolib');
var pg=require('pg');
var config = {
  user: 'cfcztdmw',
  password: 'cwoSPdD64RVYDJnLU4WGRGBanOzzV4Hp',
  port: 5432,
  host: 'rogue.db.elephantsql.com',
  database: 'cfcztdmw'
}
var pool= new pg.Pool(config);
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'donesi.kod.mene@gmail.com',
    pass: 'donesi123'
  }
});


let a=function (req,res,next){
  if(!req.session.userID){
    res.redirect('/');
  }else{
    next();
  }
}




function jelURadijusu(l,lon,l2,lon2,r){
  return geolib.isPointWithinRadius(
      { latitude: l, longitude: lon },
      { latitude: l2, longitude: lon2 },
      r*1000
  );
}

let db={
  getAdresaOdKorisnika: function (req,res,next){
    pool.connect(function(err,client,done){
      if(err){
        console.info("Došlo je do greške pri spajanju na bazu podataka.");
      }else{
        client.query(`select longituda,latituda from korisnik inner 
                    join adresa a on korisnik.id_adrese=a.id where korisnik.id=$1;`,[req.session.userID],function(err,result){
          done();
          if(err){
            console.info("Došlo je do greške pri upitu.");
          }else{
            req.korisnikAdresa=result.rows;
            next();
          }
        });
      }
    });
  },
  getSveRestorane: function (req,res,next){
    pool.connect(function(err,client,done){
      if(err){
        console.info("Došlo je do greške pri spajanju na bazu podataka.");
      }else{
        client.query(`select restoran.naziv,restoran.id,a.naziv_ulice,a.latituda,a.longituda,slika,opis,radijus from restoran
                      inner join adresa a on a.id = restoran.id_adresa;`,[],function(err,result){
          done();
          if(err){
            console.info("Došlo je do greške pri upitu.");
          }else{
            req.restorani=result.rows;
            next();
          }
        });
      }
    });
  },
  getKorisnikEmail: function (req,res,next){
    pool.connect(function(err,client,done){
      if(err){
        console.info("Došlo je do greške pri spajanju na bazu podataka.");
      }else{
        client.query(`select email from korisnik where id=$1`,[req.session.userID],function(err,result){
          done();
          if(err){
            console.info("Došlo je do greške pri upitu.");
          }else{
            req.Email=result.rows[0];
            next();
          }
        });
      }
    });

  },
  getSveNesto: function (req,res,next){
    pool.connect(function(err,client,done){
      if(err){
        console.info("Došlo je do greške pri spajanju na bazu podataka.");
      }else{
        client.query(`select tp.ime as "proizvod",n.datum,k2.naziv as "vrsta",r.naziv,tp.opis,np.id_narudzbe,np.kolicina
       ,a2.naziv_ulice,n.aktivna,a2.latituda,a2.longituda,n.id_dostavljaca,r.id as "id_restorana",k.id as "id_korisnika",
       (select  ime from
        korisnik
           inner join restoran_dostavljac d on korisnik.id = d.id_dostavljaca
           where d.id=n.id_dostavljaca) as "ime_dostavljaca",(select  prezime from
        korisnik
           inner join restoran_dostavljac d on korisnik.id = d.id_dostavljaca
           where d.id=n.id_dostavljaca) as "prezime_dostavljaca",
                            CASE
                                when a.vrijednost is null then tp.cijena
                                else a.vrijednost
                              end as "cijena"
                              from tip_proizvod tp
                              left join akcija a on a.id = tp.akcija
                              inner join narudzba_proizvod np on tp.id_proizvod = np.id_proizvoda
                              inner join restoran r on tp.id_restorana = r.id
                              inner join narudzbe n on np.id_narudzbe = n.id
                              inner join korisnik k on n.id_kupca = k.id
                              inner join adresa a2 on k.id_adrese = a2.id
                              inner join restoran_dostavljac rd on n.id_dostavljaca = rd.id
                              inner join kategorija k2 on tp.id_kategorije = k2.id
                              where k.id=$1;`,[req.session.userID],function(err,result){
          done();
          if(err){
            console.info("Došlo je do greške pri upitu.");
          }else{
            req.Sve=result.rows;
            next();
          }
        });
      }
    });
  }
}





/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Express'});
  let datum=new Date();

});

router.get('/home',a,db.getAdresaOdKorisnika,db.getSveRestorane,function (req,res,next){
  let restoran=req.restorani;
  let kornik=req.korisnikAdresa;
  let niz=[];

  for(let i=0;i<restoran.length;i++){
    let radijus=restoran[i].radijus || 10;
    if(jelURadijusu(kornik[0].latituda,kornik[0].longituda,restoran[i].latituda,restoran[i].longituda,radijus)){
      niz.push(restoran[i]);
    }
  }
  console.log(niz);
  res.render('kupac/pocetna',{
        restoran: niz
  });
});
router.get('/r/:id',a,function (req,res,next){
  let id=req.params.id;
  console.log(id);
  pool.connect(function(err,client,done){
    if(err){
      console.info("Došlo je do greške pri spajanju na bazu podataka.");
    }else{
      client.query(`select r.naziv,a.naziv_ulice,tp.ime,tp.cijena,k.naziv as "kat",r.slika as "restoran_slika",
                    tp.slika as "tp_slika",a2.vrijednost,a2.pocetak,a2.kraj,tp.opis,r.opis as "restoran_opis",r.radijus,
                    tr.tip,k2.ime as "ime_korisnika",k2.prezime,tp.id_proizvod as "proizvod_id" from restoran r
                    inner join adresa a on a.id = r.id_adresa
                    inner join tip_proizvod tp on r.id = tp.id_restorana
                    inner join kategorija k on tp.id_kategorije = k.id
                    left join akcija a2 on a2.id = tp.akcija
                    inner join tip_restorana tr on r.id_tip = tr.id
                    inner join korisnik k2 on k2.id = r.id_vlasnik
                    where r.id=$1;`,[id],function(err,result){
        done();
        if(err){
          console.info("Došlo je do greške pri upitu.");
        }else{
          var upit = result.rows;
          console.log(upit);
          pool.connect(function(err,client,done){
            if(err){
              console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
              client.query(`select tp.ime as "tp_ime",grupni_menu.cijena,tp.opis as "opis_tp",
                             tp2.ime as "tp_ime2",tp2.opis as "opis_tp2",tp.id_proizvod as "proizvod1_id",
                             tp2.id_proizvod as "proizvod2_id",k.naziv as "kat1",k1.naziv as "kat2",
                             tp.slika as "proizvod1_slika",tp2.slika as "proizvod2_slika"
                      from grupni_menu
                      inner join tip_proizvod tp on tp.id_proizvod = grupni_menu.proizvod1
                      inner join tip_proizvod tp2 on tp2.id_proizvod=grupni_menu.proizvod2
                      inner join kategorija k on tp.id_kategorije = k.id
                      inner join kategorija k1 on tp2.id_kategorije=k1.id
                      where restoran=$1;`,[id],function(err,result1){
                done();
                if(err){
                  console.info("Došlo je do greške pri upitu.");
                }else{
                  console.log(upit);
                  let gm=result1.rows;
                  res.render('kupac/restoran',{
                    restoran: upit,
                    title: upit[0].naziv,
                    gm: gm
                  });
                }
              });
            }
          });

        }
      });
    }
  });
});

router.post('/podaci',a,db.getKorisnikEmail,function (req,res,next){
  const{id_p,c,k,vrijeme}=req.body;
  let datum=new Date();
  let hour=datum.getHours();
  let minute=datum.getMinutes();
  let second=datum.getSeconds();
  let novo_vrijeme=hour+":"+minute+":"+second;
  let min_vrijeme=vrijeme || novo_vrijeme;
  let tacno=true;
  let upit;

  pool.connect(function(err,client,done){
    if(err){
      console.info("Došlo je do greške pri spajanju na bazu podataka.");
    }else{
      client.query(`insert into narudzbe(datum, aktivna, id_kupca, vrijeme_dostave) 
                    values($1,$2,$3,$4); `,[datum,tacno,req.session.userID,min_vrijeme],function(err,result){
        done();
        if(err){
          console.info("Došlo je do greške pri upitu.");
        }else{

          pool.connect(function(err,client,done){
            if(err){
              console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
              client.query(`select * from narudzbe;`,[],function(err,result){
                done();
                if(err){
                  console.info("Došlo je do greške pri upitu.");
                }else{
                  upit = result.rows[result.rows.length-1];
                  console.log(upit);

                  for(let i=0;i<id_p.length;i++){
                    pool.connect(function(err,client,done){
                      if(err){
                        console.info("Došlo je do greške pri spajanju na bazu podataka.");
                      }else{
                        client.query(`insert into narudzba_proizvod(id_narudzbe, id_proizvoda, kolicina, cijena)
                      values($1,$2,$3,$4);`,[upit.id,id_p[0],k[0],c[0]],function(err,result){
                          done();
                          if(err){
                            console.info("Došlo je do greške pri upitu.");
                          }else{
                            if(i===id_p.length-1){
                              var mailOptions = {
                                from: 'donesi.kod.mene@gmail.com',
                                to: req.Email.email,
                                subject: 'Narudžba',
                                text: 'Pozdravi, vaša narudžba je spašena!'
                              };
                              transporter.sendMail(mailOptions, function(error, info){
                                if (error) {
                                  console.log(error);
                                } else {
                                  res.redirect('/trenutna/'+upit.id);
                                }
                              });
                            }
                          }
                        });
                      }
                    });
                  }
                }
              });
            }
          });

        }
      });
    }
  });
});

router.get('/trenutna/:id',a,function (req,res,next){
  pool.connect(function(err,client,done){
    if(err){
      console.info("Došlo je do greške pri spajanju na bazu podataka.");
    }else{
      client.query(`SELECT * FROM narudzbe where id=$1`,[req.params.id],function(err,result){
        done();
        if(err){
          console.info("Došlo je do greške pri upitu.");
        }else{
          var upit = result.rows;
          res.render('kupac/obicna',{tabela:upit});
        }
      });
    }
  });
});

router.get('/narudzbe',a,db.getSveNesto,function (req,res,next){
      res.render('kupac/ndz',{
        sve: req.Sve
      });
});

router.post('/kritika/:id/:id_restorana',a,function (req,res,next){
  const {ocjena,opis}=req.body;
  pool.connect(function(err,client,done){
    if(err){
      console.info("Došlo je do greške pri spajanju na bazu podataka.");
    }else{
      client.query(`insert into kritika(id_korisnika, id_restorana, ocjena, opis) 
                    values($1,$2,$3,$4);`,[req.params.id,req.params.id_restorana,ocjena,opis],function(err,result){
        done();
        if(err){
          console.info("Došlo je do greške pri upitu.");
        }else{
          res.redirect('/narudzbe')
        }
      });
    }
  });
});


module.exports = router;
