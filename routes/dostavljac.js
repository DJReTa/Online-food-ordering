var express = require('express');
var router = express.Router();
var pg=require('pg');
var config = {
    user: 'cfcztdmw',
    password: 'cwoSPdD64RVYDJnLU4WGRGBanOzzV4Hp',
    port: 5432,
    host: 'rogue.db.elephantsql.com',
    database: 'cfcztdmw'
}
var pool= new pg.Pool(config);

const provjera=function (req,res,next){
    if(req.session.user_uloga===3 || req.session.user_uloga===1){
        next();
    }else{
        res.redirect('/');
    }
}

let db={
  getDanasnjeNarudzbe: function (req,res,next){
      pool.connect(function(err,client,done){
          if(err){
              console.info("Došlo je do greške pri spajanju na bazu podataka.");
          }else{
              client.query(`select n.id,n.datum,k.ime,sum(np.cijena*np.kolicina) as "cijena" from narudzbe n
                            inner join korisnik k on k.id = n.id_kupca
                            inner join narudzba_proizvod np on n.id = np.id_narudzbe
                            inner join tip_proizvod tp on np.id_proizvoda = tp.id_proizvod
                            inner join restoran_dostavljac rd on n.id_dostavljaca = rd.id
                            where n.aktivna=true and rd.id_dostavljaca=$1
                            group by  n.id,n.datum,k.ime;`,[req.session.userID],function(err,result){
                  done();
                  if(err){
                      console.info("Došlo je do greške pri upitu.");
                  }else{
                      req.danas=result.rows;
                      console.log(req.danas);
                      next();
                  }
              });
          }
      });
  },
    getSveNarudzbe: function (req,res,next){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`select tp.ime as "proizvod",n.datum,k2.naziv as "vrsta",r.naziv,tp.opis,np.id_narudzbe,np.kolicina,k.ime,a2.naziv_ulice,n.aktivna,a2.latituda,a2.longituda,
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
                              where rd.id_dostavljaca=$1;`,[req.session.userID],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        req.narudzba=result.rows;
                        console.log(req.narudzba);
                        next();
                    }
                });
            }
        });

    }

};



/* GET home page. */
router.get('/',db.getDanasnjeNarudzbe,db.getSveNarudzbe,provjera,function(req, res, next) {
    res.render('dostavljac/glavna', {title: 'Dostavljac',
                                        nar: req.danas,
                                        sve: req.narudzba
    });

});

router.get('/narudzbe',db.getSveNarudzbe,provjera,function (req,res,next){
   res.render('popravkaMape',{
       sve: req.narudzba
   })
});

router.get('/obavijest',provjera,function (req,res,next){
   res.render('dostavljac/obavjest',{
         title: 'Obavijest',
         idN: req.session.userID
    });
});

router.post('/obavjest',provjera,function (req,res,next){
    const{id,obavijest,idNarudzbe}=req.body;
    pool.connect(function(err,client,done){
        if(err){
            console.info("Došlo je do greške pri spajanju na bazu podataka.");
        }else{
            client.query(`insert into obavjest(id_admina, id_dostavljaca, id_narudzbe, obavjest) values($1,$2,$3,$4);`,[1,id,idNarudzbe,obavijest],function(err,result){
                done();
                if(err){
                    console.info("Došlo je do greške pri upitu.");
                }else{
                    res.redirect('/dostavljac');
                }
            });
        }
    });
});


module.exports = router;