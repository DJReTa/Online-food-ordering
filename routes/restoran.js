var express = require('express');
var router = express.Router();
var pg = require('pg');
const multer = require('multer');
const mapquest=require('mapquest');
let fs = require('fs');
var config = {
    user: 'cfcztdmw',
    password: 'cwoSPdD64RVYDJnLU4WGRGBanOzzV4Hp',
    port: 5432,
    host: 'rogue.db.elephantsql.com',
    database: 'cfcztdmw'
}
var pool= new pg.Pool(config);
var passwordHash=require('password-hash');

var storage = multer.diskStorage({
    destination: function (req,file,callback) {
        let dir = "./public/images";

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        callback(null,dir);
    },

    filename: function (req,file,callback){
        callback(null,file.originalname);
    }
});

var upload = multer({ storage: storage });

const jelAdminIliRestroan=function (req,res,next){
    if(req.session.user_uloga===1 || req.session.user_uloga===2){
        next();
    }else{
        res.redirect('/');
    }
};

let db={
    getRestoranIAdmin: function (req,res,next){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`select * from korisnik
                                inner join restoran r on korisnik.id = r.id_vlasnik
                                inner join tip_restorana tr on r.id_tip = tr.id
                                where korisnik.id=$1;`,[req.session.userID],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        req.restoranAdmin=result.rows;
                        console.log(req.restoranAdmin);
                        next();
                    }
                });
            }
        });
    },
    getKateg: function (req,res,next){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`select * from kategorija;`,[],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        req.Kategorija=result.rows;
                        console.log(req.Kategorija);
                        next();
                    }
                });
            }
        });

    },
    getRestOdAdmin: function (req,res,next){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`select * from restoran where id_vlasnik=$1;`,[req.session.userID],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        req.Rest=result.rows;
                        console.log(result.rows);
                        next();
                    }
                });
            }
        });

    },
    getTipProizvod: function (req,res,next){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`select * from restoran where id_vlasnik=$1;`,[req.session.userID],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        pool.connect(function(err,client,done){
                            if(err){
                                console.info("Došlo je do greške pri spajanju na bazu podataka.");
                            }else{
                                client.query(`select * from tip_proizvod
                                              left join akcija a on a.id = tip_proizvod.akcija 
                                              where id_restorana=$1;`,[result.rows[0].id],function(err,result1){
                                    done();
                                    if(err){
                                        console.info("Došlo je do greške pri upitu.");
                                    }else{
                                        req.proizvod=result1.rows;
                                        console.log(result.rows);
                                        next();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    },
    getAktivneNarudzbe: function (req,res,next){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`select distinct narudzbe.id,narudzbe.datum,narudzbe.id_dostavljaca,narudzbe.id_kupca from narudzbe
                              inner join narudzba_proizvod np on narudzbe.id = np.id_narudzbe
                              inner join tip_proizvod tp on np.id_proizvoda = tp.id_proizvod
                              where id_restorana=$1 and aktivna=true;`,[req.Rest[0].id],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        req.Narudzbe=result.rows;
                        next();
                    }
                });
            }
        });
    },
    getDostavljace: function (req,res,next){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`select distinct k.ime,k.prezime,rd.id,k.email from restoran
                              inner join restoran_dostavljac rd on restoran.id = rd.id_restorana
                              inner join korisnik k on rd.id_dostavljaca = k.id
                              where restoran.id=$1;`,[req.Rest[0].id],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        req.Dostavljaci=result.rows;
                        next();
                    }
                });
            }
        });
    },
    getGrupniMenu: function (req,res,next){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                done();
                client.query(`SELECT id FROM restoran where id_vlasnik=$1`,[req.session.userID],function(err,result){
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        pool.connect(function(err,client,done){
                            if(err){
                                console.info("Došlo je do greške pri spajanju na bazu podataka.");
                            }else{
                                done();
                                client.query(`select tp.ime as "tp_ime",grupni_menu.cijena,tp.opis as "opis_tp",
                                                 tp2.ime as "tp_ime2",tp2.opis as "opis_tp2",tp.id_proizvod as "proizvod1_id",
                                                 tp2.id_proizvod as "proizvod2_id",k.naziv as "kat1",k1.naziv as "kat2",
                                                 tp.slika as "proizvod1_slika",tp2.slika as "proizvod2_slika"
                                          from grupni_menu
                                          inner join tip_proizvod tp on tp.id_proizvod = grupni_menu.proizvod1
                                          inner join tip_proizvod tp2 on tp2.id_proizvod=grupni_menu.proizvod2
                                          inner join kategorija k on tp.id_kategorije = k.id
                                          inner join kategorija k1 on tp2.id_kategorije=k1.id
                                          where restoran=$1;`,[result.rows[0].id],function(err,result1){
                                    if(err){
                                        console.info("Došlo je do greške pri upitu.");
                                    }else{
                                        req.gm=result1.rows;
                                        next();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}


/* GET home page. */
router.get('/',jelAdminIliRestroan,db.getRestoranIAdmin,db.getRestOdAdmin,db.getTipProizvod,db.getGrupniMenu, function(req, res, next) {

    res.render('restoran/restoran.ejs', {
        title: 'Zdravo',
        restoran: req.restoranAdmin,
        rest: req.Rest,
        proizvod: req.proizvod,
        gm: req.gm
    });
});

router.get('/kateg',jelAdminIliRestroan,db.getKateg,function (req,res,next){
   res.render('restoran/kategorija.ejs',{
      kateg: req.Kategorija
   });
});

router.post('/dodaj',jelAdminIliRestroan,upload.single('files'),db.getRestoranIAdmin,function (req,res,next){
   console.log(req.body);
   const {vrijednost,pocetakAkcije,krajAkcije,proizvod,restoranId,opis,idKateg,cijena}=req.body;
   let errors=[];
   if(!proizvod || !opis || !idKateg || !cijena || !req.file.originalname){
       errors.push({msg: "Morate unijeti proizvod i ostalo al ne morate akciju"});
   }
   if((!pocetakAkcije && krajAkcije) || (!krajAkcije && pocetakAkcije)){
       errors.push({msg: "Morate unijeti pocetak akcije i kraj!"});
   }


   if(errors.length>0){
       res.render('restoran/restoran.ejs',{
          title: 'Zdravo',
           restoran: req.restoranAdmin,
           errors
       });
   }else{

       if(pocetakAkcije>krajAkcije){
           errors.push({msg:"Pocetak akcije mora biti prije kraja akcije!"});
           res.render('restoran/restoran.ejs',{
               title: 'Zdravo',
               restoran: req.restoranAdmin,
               errors
           });
       }
       console.log(req.file.originalname);
       if(pocetakAkcije) {
           console.log("Ima akcije");
           pool.connect(function (err, client, done) {
               if (err) {
                   console.info("Došlo je do greške pri spajanju na bazu podataka.");
               } else {
                   let x=vrijednost-(vrijednost*cijena);
                   x.toFixed(2);
                   client.query(`insert into akcija(vrijednost, pocetak, kraj) values($1,$2,$3);`, [x, pocetakAkcije, krajAkcije], function (err, result) {
                       done();
                       if (err) {
                           console.info("Došlo je do greške pri upitu.");
                       } else {
                           pool.connect(function(err,client,done){
                               if(err){
                                   console.info("Došlo je do greške pri spajanju na bazu podataka.");
                               }else{
                                   client.query(`SELECT * FROM akcija;`,[],function(err,result1){
                                       done();
                                       if(err){
                                           console.info("Došlo je do greške pri upitu.");
                                       }else{
                                           let akcija= result1.rows[result1.rows.length-1];
                                           console.log(akcija.id);
                                           pool.connect(function(err,client,done){
                                               if(err){
                                                   console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                               }else{
                                                   client.query(`insert into tip_proizvod(ime, id_restorana, cijena, id_kategorije, opis, akcija, slika)
                                                                values ($1,$2,$3,$4,$5,$6,$7);`,[proizvod,restoranId,cijena,idKateg,opis,akcija.id,req.file.originalname],function(err,result2){
                                                       done();
                                                       if(err){
                                                           console.info("Došlo je do greške pri upitu tip_proizvod.");
                                                       }else{
                                                            res.redirect('/restoran');
                                                       }
                                                   });
                                               }
                                           });
                                       }
                                   });
                               }
                           });
                       }
                   });
               }
           });
       }else {
           console.log("Nema akcije");
           pool.connect(function (err, client, done) {
               if (err) {
                   console.info("Došlo je do greške pri spajanju na bazu podataka.");
               } else {
                   client.query(`insert into tip_proizvod(ime, id_restorana, cijena, id_kategorije, opis, slika)
                                                                values ($1,$2,$3,$4,$5,$6);`, [proizvod, restoranId, cijena, idKateg, opis, req.file.originalname], function (err, result2) {
                       done();
                       if (err) {
                           console.info("Došlo je do greške pri upitu tip_proizvod.");
                       } else {
                           res.redirect('/restoran');
                       }
                   });
               }
           });
       }

   }
});
router.post('/menu',jelAdminIliRestroan,function (req,res,next){
    console.log(req.body);
   const{prvi,drugi,restoranId,cijena}=req.body;
    pool.connect(function(err,client,done){
        if(err){
            console.info("Došlo je do greške pri spajanju na bazu podataka.");
        }else{
            client.query(`insert into grupni_menu(proizvod1,proizvod2,restoran,cijena) values($1,$2,$3,$4);`,[prvi,drugi,restoranId,cijena],function(err,result){
                done();
                if(err){
                    console.info("Došlo je do greške pri upitu.");
                }else{
                    res.redirect('/restoran');
                }
            });
        }
    });
});

router.get('/dostavljac',jelAdminIliRestroan,function (req,res,next){
    res.render('restoran/dostavljac',{
        title: "Racun za dostavljac"
    })
});

router.post('/register',jelAdminIliRestroan,function(req,res,next){
    console.log(req.body);
    const {name,email,password2,Adresa,Grad,username,prezime,broj}=req.body;
    var password=req.body.password;
    let errors=[];
    if(!name || !email || !password || !password2 || !Adresa || !prezime || !broj)
        errors.push({msg: "Molim vas popunite sve forme"});
    if(password !== password2){
        errors.push({msg: "Sifre nisu jednake!"});
    }
    if(password.length<6){
        errors.push({msg: "Sifra mora imat minimalno 6 karaktera."});
    }
    if(errors.length>0){
        res.render('restoran/dostavljac', {
            title: "Racun za dostavljac",
            errors,
            name,
            prezime,
            email,
            password,
            Adresa,
            password2,
            username,
        });
    }else{
        pool.connect(function(err,client,done) {
            if (err) {
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            } else {
                client.query(`Select * from korisnik;`, [], function (err, result) {
                    done();
                    if (err) {
                        console.info("Došlo je do greške pri upitu.");
                    } else {
                        let dalPostojiEmail=false;
                        let dalPostojiUser=false;
                        for(let i=0;i<result.rows.length;i++){
                            if(email===result.rows[i].email){
                                dalPostojiEmail=true;
                                errors.push({msg: "Email već postoji!"});
                            }
                            if(username===result.rows[i].userrname){
                                dalPostojiUser=true;
                                errors.push({msg: "Username je već zauzet!"});
                            }
                        }
                        if(dalPostojiEmail || dalPostojiUser) res.render('restoran/dostavljac', {
                            title: "Racun za dostavljac",
                            errors,
                            name,
                            prezime,
                            email,
                            password,
                            Adresa,
                            password2,
                            username
                        });
                        else{
                            var hashedPassword = passwordHash.generate(password);
                            pool.connect(function(err,client,done){
                                if(err){
                                    console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                }else{
                                    client.query(`Select * from adresa where naziv_ulice LIKE $1 || '%';`,[Adresa+' '+broj],function(err,result1){
                                        done();
                                        if(err){
                                            console.info("Došlo je do greške pri upitu.");
                                        }else{
                                            var index=-1;
                                            for(let i=0;i<result1.rows.length;i++){
                                                if(Adresa+' '+broj===result1.rows[i].naziv_ulice){
                                                    index=result1.rows[i].id;
                                                    break;
                                                }
                                            }

                                            if(index!==-1){
                                                pool.connect(function (err,client,done){
                                                    if(err){
                                                        console.log("Došlo je do greške pri spajanju na bazu podataka.");
                                                    }
                                                    else{
                                                        client.query(`insert into korisnik(ime, prezime, userrname, password, email, id_uloge, id_adrese) values ($1,$2,$3,$4,$5,3,$6);`,
                                                            [name,prezime,username,hashedPassword,email,index],function (err,result2){
                                                                done();
                                                                if(err){
                                                                    console.log("Došlo do greške pri insert upitu.");
                                                                }else{
                                                                    res.redirect('/restoran');
                                                                }
                                                            });
                                                    }
                                                });
                                            }
                                            else{
                                                mapquest.geocode({ address: Adresa+' '+broj+' '+Grad }, function(err, location) {
                                                    if(err){
                                                        console.log("Došla greška pri mapqestu");
                                                    }
                                                    else{
                                                        if(location.street===''){
                                                            errors.push({msg: 'Ne postoji unesena adresa'});
                                                            res.render('restoran/dostavljac', {
                                                                title: "Racuna za dostavljaca",
                                                                errors,
                                                                name,
                                                                prezime,
                                                                email,
                                                                password,
                                                                Adresa,
                                                                password2,
                                                                username
                                                            });
                                                        }
                                                        else{
                                                            pool.connect(function (err,client,done){
                                                                if(err){
                                                                    res.send('{"error": "Error", "status" ; 500}');
                                                                }
                                                                client.query("insert into adresa(grad, naziv_ulice, latituda, longituda) values($1,$2,$3,$4)",
                                                                    [Grad,Adresa+' '+broj,location.latLng.lat,location.latLng.lng],
                                                                    function (err,result3){
                                                                        done();
                                                                        if(err){
                                                                            console.log(err);
                                                                            res.sendStatus(500);
                                                                        }else {
                                                                            pool.connect(function(err,client,done){
                                                                                done();
                                                                                if(err){
                                                                                    console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                                                                }else{
                                                                                    client.query(`SELECT id FROM adresa where naziv_ulice like $1 || '%'`,[Adresa],function(err,result4){
                                                                                        if(err){
                                                                                            console.info("Došlo je do greške pri upitu.");
                                                                                        }else{
                                                                                            pool.connect(function(err,client,done){
                                                                                                done();
                                                                                                if(err){
                                                                                                    console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                                                                                }else{
                                                                                                    client.query(`insert into korisnik(ime, prezime, userrname, password, email, id_uloge, id_adrese) values ($1,$2,$3,$4,$5,3,$6);`,
                                                                                                        [name,prezime,username,hashedPassword,email,result4.rows[0].id],
                                                                                                        function(err,result5){
                                                                                                            if(err){
                                                                                                                console.info("Došlo je do greške pri upitu.");
                                                                                                            }else{
                                                                                                                res.redirect('/restoran');
                                                                                                            }
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
                                                        }
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

router.get('/edit',jelAdminIliRestroan,db.getRestOdAdmin,db.getTipProizvod,function (req,res,next){
   res.render('restoran/edit',{
      title: 'Edit',
       restoran: req.Rest,
       proizvod: req.proizvod
   });
});

router.post('/update',jelAdminIliRestroan,function (req,res,next){
   const{radijus,opis,id}=req.body;
    pool.connect(function(err,client,done){
        if(err){
            console.info("Došlo je do greške pri spajanju na bazu podataka.");
        }else{
            client.query(`update restoran
                          set radijus=$1,opis=$2
                          where id=$3;`,[radijus,opis,id],function(err,result){
                done();
                if(err){
                    console.info("Došlo je do greške pri upitu.");
                }else{
                    res.redirect('/restoran');
                }
            });
        }
    });
});

router.get('/dostave',jelAdminIliRestroan,db.getRestOdAdmin,db.getAktivneNarudzbe,db.getDostavljace,function (req,res,next){
    res.render('restoran/dostave',{
                    narudzbe: req.Narudzbe,
                    dostave: req.Dostavljaci
    });
});

router.post('/dostave',jelAdminIliRestroan,function (req,res,next){
   const{id_dostavljaca,id_narudzbe}=req.body;
   console.log(id_dostavljaca,id_narudzbe);
    pool.connect(function(err,client,done){
        if(err){
            console.info("Došlo je do greške pri spajanju na bazu podataka.");
        }else{
            client.query(`update narudzbe set id_dostavljaca=$1 where id=$2;`,[id_dostavljaca,id_narudzbe],function(err,result){
                done();
                if(err){
                    console.info("Došlo je do greške pri upitu.");
                }else{
                    res.redirect('/restoran/dostave');
                }
            });
        }
    });
});
router.post('/automatski/:id_narudzbe',jelAdminIliRestroan,db.getRestOdAdmin,function (req,res,next){
    pool.connect(function(err,client,done){
        if(err){
            console.info("Došlo je do greške pri spajanju na bazu podataka.");
        }else{
            client.query(`select count(rd.id),rd.id from restoran
                            right join restoran_dostavljac rd on restoran.id = rd.id_restorana
                            left join narudzbe n on rd.id = n.id_dostavljaca
                            where restoran.id=$1
                            group by rd.id
                            order by count(rd.id) asc  limit  1;`,[req.Rest[0].id],function(err,result){
                done();
                if(err){
                    console.info("Došlo je do greške pri upitu.");
                }else{
                    pool.connect(function(err,client,done){
                        if(err){
                            console.info("Došlo je do greške pri spajanju na bazu podataka.");
                        }else{
                            client.query(`update narudzbe set id_dostavljaca=$1 where id=$2;`,[result.rows[0].id,req.params.id_narudzbe],function(err,result){
                                done();
                                if(err){
                                    console.info("Došlo je do greške pri upitu.");
                                }else{
                                    res.redirect('/restoran/dostave');
                                }
                            });
                        }
                    });

                }
            });
        }
    });
});

router.post('/zatvori/:id',jelAdminIliRestroan,function (req,res,next){
    pool.connect(function(err,client,done){
        if(err){
            console.info("Došlo je do greške pri spajanju na bazu podataka.");
        }else{
            client.query(`update narudzbe set aktivna=false where id=$1;`,[req.params.id],function(err,result){
                done();
                if(err){
                    console.info("Došlo je do greške pri upitu.");
                }else{
                    res.redirect('/restoran/dostave');
                }
            });
        }
    });
});
router.post('/update/artikal',jelAdminIliRestroan,upload.single('files'),function (req,res,next){
    console.log(req.body);
    const{proizvod,cijena,opis,idRestorana}=req.body;
    pool.connect(function(err,client,done){
        if(err){
            console.info("Došlo je do greške pri spajanju na bazu podataka.");
        }else{
            client.query(`update tip_proizvod
                          set ime=$1, cijena=$2, opis=$3
                           where id_proizvod=$4;`,[proizvod,cijena,opis,idRestorana],function(err,result){
                done();
                if(err){
                    console.info("Došlo je do greške pri upitu.");
                }else{
                    res.redirect('/restoran');
                }
            });
        }
    });
});


module.exports = router;
