var express = require('express');
var router = express.Router();
var pg = require('pg');
const mapquest=require('mapquest');
const multer = require('multer');
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




let db={
    getKorisnik: function (req,res,next){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`SELECT * FROM korisnik;`,[],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        req.kor=result.rows;
                        next();
                    }
                });
            }
        });
    },
    getRestoran: function (req,res,next){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`SELECT * FROM restoran;`,[],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        req.restoran=result.rows;
                        next();
                    }
                });
            }
        });

    },
    getUloga: function (req,res,next) {
        pool.connect(function (err, client, done) {
            if (err) {
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            } else {
                client.query(`SELECT * FROM uloga;`, [], function (err, result) {
                    done();
                    if (err) {
                        console.info("Došlo je do greške pri upitu.");
                    } else {
                        req.uloga = result.rows;
                        next();
                    }
                });
            }
        });
    },
    getAdresa: function (req, res, next) {
        pool.connect(function (err, client, done) {
            if (err) {
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            } else {
                client.query(`SELECT * FROM adresa;`, [], function (err, result) {
                    done();
                    if (err) {
                        console.info("Došlo je do greške pri upitu.");
                    } else {
                        req.adresa = result.rows;
                        next();
                    }
                });
            }
        });
    },
    getTip: function (req, res, next) {
        pool.connect(function (err, client, done) {
            if (err) {
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            } else {
                client.query(`SELECT * FROM tip_restorana;`, [], function (err, result) {
                    done();
                    if (err) {
                        console.info("Došlo je do greške pri upitu.");
                    } else {
                        req.tip= result.rows;
                        next();
                    }
                });
            }
        });
    },
    getKategorija: function (req, res, next) {
        pool.connect(function (err, client, done) {
            if (err) {
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            } else {
                client.query(`SELECT * FROM kategorija;`, [], function (err, result) {
                    done();
                    if (err) {
                        console.info("Došlo je do greške pri upitu.");
                    } else {
                        req.kategorija= result.rows;
                        next();
                    }
                });
            }
        });
    },
    getNarudzbe: function (req,res,next){
        pool.connect(function (err, client, done) {
            if (err) {
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            } else {
                client.query(`SELECT * FROM narudzbe;`, [], function (err, result) {
                    done();
                    if (err) {
                        console.log("narudzbe");
                        console.info("Došlo je do greške pri upitu.");
                    } else {
                        req.Nar= result.rows;
                        next();
                    }
                });
            }
        });
    },
    getNarudzbeProizvod: function (req,res,next){
        pool.connect(function (err, client, done) {
            if (err) {
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            } else {
                client.query(`SELECT * FROM narudzba_proizvod;`, [], function (err, result) {
                    done();
                    if (err) {
                        console.log("narudzbe_proizvod");
                        console.info("Došlo je do greške pri upitu.");
                    } else {
                        req.NarPro= result.rows;
                        next();
                    }
                });
            }
        });
    },
    getProizvod: function (req,res,next){
        pool.connect(function (err, client, done) {
            if (err) {
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            } else {
                client.query(`SELECT * FROM tip_proizvod;`, [], function (err, result) {
                    done();
                    if (err) {
                        console.log("proizvod");
                        console.info("Došlo je do greške pri upitu.");
                    } else {
                        req.Pro= result.rows;
                        next();
                    }
                });
            }
        });

    },
    getMenu: function (req,res,next){
        pool.connect(function (err, client, done) {
            if (err) {
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            } else {
                client.query(`SELECT * FROM grupni_menu;`, [], function (err, result) {
                    done();
                    if (err) {
                        console.log("menu");
                        console.info("Došlo je do greške pri upitu.");
                    } else {
                        req.Men= result.rows;
                        next();
                    }
                });
            }
        });
    }

};


const jelAdmin=function (req,res,next){
  if(req.session.user_uloga!==1){
      res.redirect('/');
  }else{

      next();
  }
};


router.get('/',jelAdmin, function (req,res,next){
   res.render('admin',{
       title: 'CRUD'

   });
});

router.get('/nastavak',jelAdmin,function (req,res,next){
   res.render('admin1',{
       title: 'CRUD-nastavak'
   })
});
router.get('/info/:tabela',jelAdmin,db.getAdresa,db.getKategorija,db.getKorisnik,db.getRestoran,db.getTip,db.getUloga,
    function(req,res,next){

    console.log(req.params.tabela);
    if(req.params.tabela==='uloga') {
        console.log("uloga");
        res.send(req.uloga);
    }
        if(req.params.tabela==='tip') {
            console.log("tip");
            res.send(req.tip);
        }
        if(req.params.tabela==='korisnik') {
            console.log("korisnik");
            res.send(req.kor);
        }
        if(req.params.tabela==='restoran') {
            console.log("restoran");
            res.send(req.restoran);
        }
        if(req.params.tabela==='kategorija') {
            console.log("kategorija");
            res.send(req.kategorija);
        }
        if(req.params.tabela==='adresa') {
            console.log("adresa");
            res.send(req.adresa);
        }
});

router.delete('/delete/:id',jelAdmin,function (req,res,next){
    pool.connect(function(err,client,done){
        if(err){
            console.info("Došlo je do greške pri spajanju na bazu podataka.");
        }else{
            client.query(`DELETE FROM korisnik WHERE id=$1;`,[req.params.id],function(err,result){
                done();
                if(err){
                    console.info("Došlo je do greške pri upitu.");
                }else{
                    res.sendStatus(200);
                }
            });
        }
    });
});
router.delete('/delete/:id/:tabela',jelAdmin,function (req,res,next){
    console.log(req.params);
    console.log(req.params.tabela);

    if(req.params.tabela==='adresa'){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`DELETE FROM adresa WHERE id=$1;`,[req.params.id],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        res.send(200);
                    }
                });
            }
        });

    }
    if(req.params.tabela==='kategorija'){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`DELETE FROM kategorija WHERE id=$1;`,[req.params.id],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        res.send(200);
                    }
                });
            }
        });

    }
    if(req.params.tabela==='restoran'){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`DELETE FROM restoran WHERE id=$1;`,[req.params.id],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        res.send(200);
                    }
                });
            }
        });

    }
    if(req.params.tabela==='korisnik'){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`DELETE FROM korisnik WHERE id=$1;`,[req.params.id],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        res.send(200);
                    }
                });
            }
        });

    }
    if(req.params.tabela==='tip_restorana'){
        pool.connect(function(err,client,done){
            if(err){
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            }else{
                client.query(`DELETE FROM tip_restorana WHERE id=$1;`,[req.params.id],function(err,result){
                    done();
                    if(err){
                        console.info("Došlo je do greške pri upitu.");
                    }else{
                        res.send(200);
                    }
                });
            }
        });

    }



});

router.get('/edit',jelAdmin,db.getUloga,db.getTip,db.getRestoran,db.getKorisnik,db.getKategorija,db.getAdresa,
    function(req,res,next){
    res.render('adminEdit',{
        title: 'Edit za admin',
        uloga: req.uloga,
        tips: req.tip,
        korisnik: req.kor,
        restoran: req.restoran,
        adresa: req.adresa,
        kategorija: req.kategorija,
    });
});
router.post('/edit/korisnik',jelAdmin,function (req,res,next) {
    console.log(req.body);
    const {ime, prezime, user, emailKorisnika, passwordKorisnik, passwordKorisnik2, idU, idA, idKorisnika} = req.body;
    let errors = [];
    if (!ime || !prezime || !user || !emailKorisnika || !idU || !idA || !idKorisnika) {
        errors.push({msg: "Molim vas popunite sve forme"});

    }

    if(idU<1 || idU>4){
        errors.push({msg: "Uloga mora biti između [1,4]!"});
    }

    if (passwordKorisnik !== '' && passwordKorisnik2 !== '') {
        if (passwordKorisnik !== passwordKorisnik2) {
            errors.push({msg: "Passwordi se ne poklapaju!"});
        }

        if (passwordKorisnik.length < 6) {
            errors.push({msg: "Password mora biti duži od 6 karaktera!"});
        }
    }
    if ((passwordKorisnik !== '' && passwordKorisnik2 === '') || (passwordKorisnik === '' && passwordKorisnik2 !== '')) {
        errors.push({msg: "Morate popuniti oba passworda!"});
    }

    if (errors.length > 0) {
        res.redirect('/admin/edit');
    } else {
        pool.connect(function (err, client, done) {
            if (err) {
                console.info("Došlo je do greške pri spajanju na bazu podataka.");
            } else {
                client.query(`SELECT * FROM korisnik where (userrname=$1 or email=$2) and id<>$3;`, [user, emailKorisnika, idKorisnika], function (err, result) {
                    done();
                    if (err) {
                        console.info("Došlo je do greške pri upitu.");
                    } else {
                        if (result.rows.length > 0) {
                            errors.push({msg: "Email ili username je već zauzet!"});
                            res.redirect('/admin/edit');
                        } else {
                            pool.connect(function(err,client,done) {
                                if (err) {
                                    console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                } else {
                                    client.query(`SELECT * FROM adresa where id=$1`, [idA], function (err, result1) {
                                        done();
                                        if (err) {
                                            console.info("Došlo je do greške pri upitu.");
                                        } else {
                                            if(result1.rows.length===0){
                                                errors.push({msg: "Adresa ne postoji"});
                                                res.redirect('/admin/edit');
                                            }else {
                                                if (passwordKorisnik !== '') {
                                                    var hashedPassword = passwordHash.generate(passwordKorisnik);
                                                    pool.connect(function (err, client, done) {
                                                        if (err) {
                                                            console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                                        } else {
                                                            client.query(`
                                                            update korisnik set ime=$1,prezime=$2,userrname=$3,password=$4,email=$5,id_uloge=$6,id_adrese=$7
                                                        where id=$8;`,
                                                                [ime,prezime,user,hashedPassword,emailKorisnika,idU,idA,idKorisnika],
                                                                function (err, result) {
                                                                    done();
                                                                    if (err) {
                                                                        console.info("Došlo je do greške pri upitu.");
                                                                    } else {
                                                                        res.redirect('/admin/edit');
                                                                    }
                                                                });
                                                        }
                                                    });
                                                }else {
                                                    pool.connect(function (err, client, done) {
                                                        if (err) {
                                                            console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                                        } else {
                                                            client.query(`update korisnik set ime=$1,prezime=$2,userrname=$3,email=$4,id_uloge=$5,id_adrese=$6
                                                        where id=$7;`,
                                                                [ime,prezime,user,emailKorisnika,idU,idA,idKorisnika],
                                                                function (err, result) {
                                                                done();
                                                                if (err) {
                                                                    console.info("Došlo je do greške pri upitu.");
                                                                } else {
                                                                    res.redirect('/admin/edit');
                                                                }
                                                            });
                                                        }
                                                    });
                                                }

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
router.post('/edit/tip',jelAdmin,function (req,res,next){
   console.log(req.body);
   let errors=[];
   const{tip,idTipa}=req.body;
   if(!tip){
       errors.push({msg: "Mora biti unijet tip restoran!"});
   }
   if(errors.length>0){
       res.redirect('/admin/edit');
   }else{
       pool.connect(function(err,client,done) {
           if (err) {
               console.info("Došlo je do greške pri spajanju na bazu podataka.");
           } else {
               client.query(`update tip_restorana set tip=$1 where id=$2;`, [tip,idTipa], function (err, result) {
                   done();
                   if (err) {
                       console.info("Došlo je do greške pri upitu.");
                   } else {
                       res.redirect('/admin/edit');
                   }
               });
           }
       });
   }
});
router.post('/edit/restoran',upload.single('files'),jelAdmin,function (req,res,next){
    console.log(req.body);
    let errors=[];
    const{naziv,adresa,vlasnik,idTipRes,idRestorana}=req.body;
    console.log(naziv+adresa+vlasnik+idRestorana+idTipRes);

    if(!naziv || !adresa || !vlasnik || !idRestorana || !idTipRes || !req.file.originalname){
        errors.push({msg: "Morate sve popuniti u formi!"});
    }

    if(errors.length>0){
        res.redirect('/admin/edit');
    }else{
            pool.connect(function (err, client, done) {
                if (err) {
                    console.info("Došlo je do greške pri spajanju na bazu podataka.");
                } else {
                    client.query(`select * from korisnik where id_uloge=$1 and id=$2;`, [2, vlasnik], function (err, result) {
                        done();
                        if (err) {
                            console.info("Došlo je do greške pri upitu.");
                        } else {
                            if (result.rows.length === 0) {
                                errors.push({msg: "Ne postoji vlasnik!"});
                                res.redirect('/admin/edit');
                            } else {
                                pool.connect(function (err, client, done) {
                                    if (err) {
                                        console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                    } else {
                                        client.query(`SELECT * FROM adresa where id=$1`, [adresa], function (err, result1) {
                                            done();
                                            if (err) {
                                                console.info("Došlo je do greške pri upitu.");
                                            } else {
                                                if (result1.rows.length === 0) {
                                                    errors.push({msg: "Adresa ne postoji!"});
                                                    res.redirect('/admin/edit');
                                                } else {
                                                    pool.connect(function (err, client, done) {
                                                        if (err) {
                                                            console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                                        } else {
                                                            client.query(`SELECT * FROM tip_restorana where id=$1`, [idTipRes], function (err, result2) {
                                                                done();
                                                                if (err) {
                                                                    console.info("Došlo je do greške pri upitu.");
                                                                } else {
                                                                    if (result2.rows.length === 0) {
                                                                        errors.push({msg: "Ne postoji tip restorana!"});
                                                                        res.redirect('/admin/edit');
                                                                    } else {
                                                                        pool.connect(function (err, client, done) {
                                                                            if (err) {
                                                                                console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                                                            } else {
                                                                                client.query(`update restoran set 
                                                                                naziv=$1,id_vlasnik=$2,id_adresa=$3,id_tip=$4,slika=$6 where id=$5;`,
                                                                                    [naziv, vlasnik, adresa, idTipRes, idRestorana, req.file.originalname], function (err, result) {
                                                                                        done();
                                                                                        if (err) {
                                                                                            console.info("Došlo je do greške pri upitu.");
                                                                                        } else {
                                                                                            res.redirect('/admin/edit');
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

router.post('/edit/kategorija',jelAdmin,function (req,res,next){
   console.log(req.body);
   let errors=[];
   const{kateg,idKate}=req.body;
   if(!kateg){
       errors.push({msg: "Niste popunili kompletnu formu!"});
   }
   if(errors.length>0){
       res.redirect('/admin/edit');
   }
    pool.connect(function(err,client,done){
        if(err){
            console.info("Došlo je do greške pri spajanju na bazu podataka.");
        }else{
            client.query(`SELECT * FROM kategorija where naziv=$1 and id<>$2`,[kateg,idKate],function(err,result){
                done();
                if(err){
                    console.info("Došlo je do greške pri upitu.");
                }else{
                    if(result.rows.length>0){
                        errors.push({msg: "Već postoji takva kategorija"});
                        res.redirect('/admin/edit');
                    }else{
                        pool.connect(function(err,client,done){
                            if(err){
                                console.info("Došlo je do greške pri spajanju na bazu podataka.");
                            }else{
                                client.query(`update kategorija set naziv=$1 where id=$2;`,[kateg,idKate],function(err,result){
                                    done();
                                    if(err){
                                        console.info("Došlo je do greške pri upitu.");
                                    }else{
                                        res.redirect('/admin/edit');
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });
});
router.get('/create',jelAdmin,function (req,res,next){
   res.render('adminCreate',{
       title: 'CRUD-Create'
   })
});

router.post('/create/:tabela',jelAdmin,function(req,res,next){
   let tabela=req.params.tabela;

   if(tabela==='tip_restorana'){
       let errors=[];
       const{tip}=req.body;
       if(!tip){
           errors.push({msg: "Mora biti unijet tip restoran!"});
       }
       if(errors.length>0){
           res.redirect('/admin/create');
       }else{
           pool.connect(function(err,client,done) {
               if (err) {
                   console.info("Došlo je do greške pri spajanju na bazu podataka.");
               } else {
                   client.query(`insert into tip_restorana(tip) values($1);`, [tip], function (err, result) {
                       done();
                       if (err) {
                           console.info("Došlo je do greške pri upitu.");
                       } else {
                           res.redirect('/admin');
                       }
                   });
               }
           });
       }
   }
   if(tabela==='restoran'){
       let errors=[];
       console.log(req.body);
       const{naziv,adresa,vlasnik,idTipRes}=req.body;

       if(!naziv || !adresa || !vlasnik  || !idTipRes){
           errors.push({msg: "Morate sve popuniti u formi!"});
       }

       if(errors.length>0){
           res.redirect('/admin/create');
       }else{
           pool.connect(function(err,client,done){
               if(err){
                   console.info("Došlo je do greške pri spajanju na bazu podataka.");
               }else{
                   client.query(`select * from korisnik where id_uloge=$1 and id=$2;`,[2,vlasnik],function(err,result){
                       done();
                       if(err){
                           console.info("Došlo je do greške pri upitu.");
                       }else{
                           if(result.rows.length===0){
                               console.log("ne postoji vlasnik");
                               errors.push({msg: "Ne postoji vlasnik!"});
                               res.redirect('/admin/create');
                           }else{
                               pool.connect(function(err,client,done){
                                   if(err){
                                       console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                   }else{
                                       client.query(`SELECT * FROM adresa where id=$1`,[adresa],function(err,result1){
                                           done();
                                           if(err){
                                               console.info("Došlo je do greške pri upitu.");
                                           }else{
                                               if(result1.rows.length===0){
                                                   errors.push({msg: "Adresa ne postoji!"});
                                                   console.log("ne postoji adresa");
                                                   res.redirect('/admin/create');
                                               }else{
                                                   pool.connect(function(err,client,done){
                                                       if(err){
                                                           console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                                       }else{
                                                           client.query(`SELECT * FROM tip_restorana where id=$1`,[idTipRes],function(err,result2){
                                                               done();
                                                               if(err){
                                                                   console.info("Došlo je do greške pri upitu.");
                                                               }else{
                                                                   if(result2.rows.length===0){
                                                                       errors.push({msg: "Ne postoji tip restorana!"});
                                                                       console.log("ne postoji tip");
                                                                       res.redirect('/admin/create');
                                                                   }else{
                                                                       pool.connect(function(err,client,done){
                                                                           if(err){
                                                                               console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                                                           }else{
                                                                               client.query(`insert into restoran(naziv, id_adresa, id_vlasnik, id_tip) values($1,$3,$2,$4);`,
                                                                                   [naziv,vlasnik,adresa,idTipRes],function(err,result){
                                                                                       done();
                                                                                       if(err){
                                                                                           console.info("Došlo je do greške pri upitu.");
                                                                                       }else{
                                                                                           res.redirect('/admin/create');
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

   }
   if(tabela==='korisnik'){
       console.log(req.body);
       const {ime, prezime, user, emailKorisnika, passwordKorisnik, passwordKorisnik2, idU, Adresa,broj} = req.body;
       let errors = [];
       if (!ime || !prezime || !user || !emailKorisnika || !idU || !Adresa || !broj || !passwordKorisnik || !passwordKorisnik2) {
           errors.push({msg: "Molim vas popunite sve forme"});

       }
       if (passwordKorisnik !== '' && passwordKorisnik2 !== '') {
           if (passwordKorisnik !== passwordKorisnik2) {
               errors.push({msg: "Passwordi se ne poklapaju!"});
           }

           if (passwordKorisnik.length < 6) {
               errors.push({msg: "Password mora biti duži od 6 karaktera!"});
           }
       }
       if ((passwordKorisnik !== '' && passwordKorisnik2 === '') || (passwordKorisnik === '' && passwordKorisnik2 !== '')) {
           errors.push({msg: "Morate popuniti oba passworda!"});
       }

       if (errors.length > 0) {
           res.render('adminCreate',{
               title: 'CRUD-Create',
               errors
           });
       } else {
           pool.connect(function (err, client, done) {
               if (err) {
                   console.info("Došlo je do greške pri spajanju na bazu podataka.");
               } else {
                   client.query(`SELECT * FROM korisnik where (userrname=$1 or email=$2);`, [user, emailKorisnika], function (err, result) {
                       done();
                       if (err) {
                           console.info("Došlo je do greške pri upitu.");
                       } else {
                           if (result.rows.length > 0) {
                               errors.push({msg: "Email ili username je već zauzet!"});
                               res.render('adminCreate',{
                                   title: 'CRUD-Create',
                                   errors
                               });
                           } else {
                               pool.connect(function(err,client,done) {
                                   if (err) {
                                       console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                   } else {
                                       client.query(`SELECT * FROM adresa where naziv_ulice like $1 || '%';`, [Adresa+" "+broj], function (err, result1) {
                                           done();
                                           if (err) {
                                               console.info("Došlo je do greške pri upitu.");
                                           } else {
                                               if(result1.rows.length===0){
                                                   errors.push({msg: "Adresa ne postoji"});
                                                   res.render('adminCreate',{
                                                       title: 'CRUD-Create',
                                                       errors
                                                   });
                                               }else {
                                                   var hashedPassword = passwordHash.generate(passwordKorisnik);
                                                   pool.connect(function (err, client, done) {
                                                       if (err) {
                                                           console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                                       } else {
                                                           client.query(`
                                                            insert into korisnik(ime, prezime, userrname, password, email, id_uloge, id_adrese) values ($1,$2,$3,$4,$5,$6,$7);`,
                                                               [ime,prezime,user,hashedPassword,emailKorisnika,idU,result1.rows[0].id_adrese],
                                                               function (err, result) {
                                                                   done();
                                                                   if (err) {
                                                                       console.info("Došlo je do greške pri upitu.");
                                                                   } else {
                                                                       res.redirect('/admin/');
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
                       }
                   });
               }
           });
       }
   }
   if(tabela==='adresa'){
       const{Grad,Adresa,broj}=req.body;
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
                       if(result1.rows.length>0) index=1;

                       if(index===1){
                           res.redirect('/admin/create');
                       }
                       else{
                           mapquest.geocode({ address: Adresa+' '+broj+' '+Grad }, function(err, location) {
                               if(err){
                                   console.log("Došla greška pri mapqestu");
                               }
                               else{
                                   if(location.street===''){
                                       errors.push({msg: 'Ne postoji unesena adresa'});
                                       res.redirect('/admin/create');
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
                                                       res.redirect('/admin/create');
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
});

router.put('/create1/restoran',jelAdmin,upload.single('files'),function (req,res,next){
        let errors=[];
        console.log(req.body);
        const{naziv,adresa,vlasnik,idTipRes}=req.body;

        if(!naziv || !adresa || !vlasnik  || !idTipRes){
            errors.push({msg: "Morate sve popuniti u formi!"});
        }

        if(errors.length>0){
            res.redirect('/admin/create');
        }else{
            pool.connect(function(err,client,done){
                if(err){
                    console.info("Došlo je do greške pri spajanju na bazu podataka.");
                }else{
                    client.query(`select * from korisnik where id_uloge=$1 and id=$2;`,[2,vlasnik],function(err,result){
                        done();
                        if(err){
                            console.info("Došlo je do greške pri upitu.");
                        }else{
                            if(result.rows.length===0){
                                console.log("ne postoji vlasnik");
                                errors.push({msg: "Ne postoji vlasnik!"});
                                res.redirect('/admin/create');
                            }else{
                                pool.connect(function(err,client,done){
                                    if(err){
                                        console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                    }else{
                                        client.query(`SELECT * FROM adresa where id=$1`,[adresa],function(err,result1){
                                            done();
                                            if(err){
                                                console.info("Došlo je do greške pri upitu.");
                                            }else{
                                                if(result1.rows.length===0){
                                                    errors.push({msg: "Adresa ne postoji!"});
                                                    console.log("ne postoji adresa");
                                                    res.redirect('/admin/create');
                                                }else{
                                                    pool.connect(function(err,client,done){
                                                        if(err){
                                                            console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                                        }else{
                                                            client.query(`SELECT * FROM tip_restorana where id=$1`,[idTipRes],function(err,result2){
                                                                done();
                                                                if(err){
                                                                    console.info("Došlo je do greške pri upitu.");
                                                                }else{
                                                                    if(result2.rows.length===0){
                                                                        errors.push({msg: "Ne postoji tip restorana!"});
                                                                        console.log("ne postoji tip");
                                                                        res.redirect('/admin/create');
                                                                    }else{
                                                                        pool.connect(function(err,client,done){
                                                                            if(err){
                                                                                console.info("Došlo je do greške pri spajanju na bazu podataka.");
                                                                            }else{
                                                                                client.query(`insert into restoran(naziv, id_adresa, id_vlasnik, id_tip) values($1,$3,$2,$4);`,
                                                                                    [naziv,vlasnik,adresa,idTipRes],function(err,result){
                                                                                        done();
                                                                                        if(err){
                                                                                            console.info("Došlo je do greške pri upitu.");
                                                                                        }else{
                                                                                            res.redirect('/admin/create');
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

router.get('/narudzbe',jelAdmin,db.getNarudzbe,db.getNarudzbeProizvod,db.getProizvod,db.getMenu,function (req,res,next){
    res.render('narudzbeAdmin',{
        nar: req.Nar,
        narPro: req.NarPro,
        pro: req.Pro,
        men: req.Men
    });
});
router.post('/narudzbe',jelAdmin,function (req,res,next){
   const{dan,mjesec,godina,id}=req.body;
   console.log(dan+","+mjesec+","+godina+","+id);
   if(!id){
       pool.connect(function(err,client,done){
           if(err){
               console.info("Došlo je do greške pri spajanju na bazu podataka.");
           }else{
               done();
               client.query(`select id_kupca,extract(year from datum) as "godina",extract(month from datum) as "mjesec",extract(day from datum) as "dan",
                             a.latituda,a.longituda,aktivna
                                from narudzbe
                            inner join korisnik k on k.id = narudzbe.id_kupca
                            inner join adresa a on k.id_adrese = a.id
                            where extract(day from datum)=$1 and extract(month from datum)=$2 and extract(year from datum)=$3;`,[dan,mjesec,godina],function(err,result){
                   if(err){
                       console.info("Došlo je do greške pri upitu.");
                   }else{
                            let upit=result.rows;
                            res.render('popravkaMape',{
                                sve: upit
                            });

                   }
               });
           }
       });
   }else{
       pool.connect(function(err,client,done){
           if(err){
               console.info("Došlo je do greške pri spajanju na bazu podataka.");
           }else{
               done();
               client.query(`select id_kupca,extract(year from datum) as "godina",extract(month from datum) as "mjesec",extract(day from datum) as "dan",
                             a.latituda,a.longituda,aktivna
                                from narudzbe
                            inner join korisnik k on k.id = narudzbe.id_kupca
                            inner join adresa a on k.id_adrese = a.id
                            where extract(day from datum)=$1 and extract(month from datum)=$2 and extract(year from datum)=$3
                            and id_dostavljaca=$4;`,[dan,mjesec,godina,id],function(err,result){
                   if(err){
                       console.info("Došlo je do greške pri upitu.");
                   }else{
                       let upit=result.rows;
                       res.render('popravkaMape',{
                           sve: upit
                       });

                   }
               });
           }
       });

   }
});








module.exports = router;