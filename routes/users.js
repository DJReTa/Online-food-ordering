var express = require('express');
var router = express.Router();
var pg = require('pg');
const mapquest=require('mapquest');
var config = {
  user: 'cfcztdmw',
  password: 'cwoSPdD64RVYDJnLU4WGRGBanOzzV4Hp',
  port: 5432,
  host: 'rogue.db.elephantsql.com',
  database: 'cfcztdmw'
}
var pool= new pg.Pool(config);
process.env.MAPQUEST_API_KEY='fP5bGsJmMqqzzOXU81LhJLdrHQF0Q9Ps';
var passwordHash=require('password-hash');


const redirectLogin = (req,res,next)=>{
  if(!req.session.userID){
    res.redirect('/users/login');
  }else{
    next();
  }
}
const redirectHome=(req,res,next)=>{
  if(req.session.userID){
    res.redirect('/users/korisnik');
  }else{
    next();
  }
}
let dbA= {
  getkorist: function (req, res, next) {
    pool.connect(function (err, client, done) {
      if (err) {
        console.info("Došlo je do greške pri spajanju na bazu podataka.");
      } else {
        client.query(`select * from korisnik k inner join adresa a on a.id = k.id_adrese where k.id=$1; `, [req.session.userID], function (err, result) {
          done();
          if (err) {
            console.info("Došlo je do greške pri upitu.");
          } else {
            req.korist=result.rows[0];
            next();
          }
        });
      }
    });
  }
}


router.get('/korisnik',redirectLogin,function (req,res,next){
  pool.connect(function(err,client,done){
    if(err){
      console.info("Došlo je do greške pri spajanju na bazu podataka.");
    }else{
      client.query(`select * from korisnik k inner join adresa a on a.id = k.id_adrese where k.id=$1; `,[req.session.userID],function(err,result){
        done();
        if(err){
          console.info("Došlo je do greške pri upitu.");
        }else{
          var upit = result.rows;
          res.render('korisnik',{title: 'Korisnik-ove informacije',
            korisnik: result.rows[0]
          });
        }
      });
    }
  });

});

/* GET users listing. */
router.get('/register',redirectHome, function(req, res, next) {
  res.render('register', { title: 'Express' });
});

router.get('/login',redirectHome, function(req, res, next) {
  res.render('login', { title: 'Express' });
});

router.post('/register',redirectHome,function(req,res,next){
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
    res.render('register', {
      title: "Register",
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
            if(dalPostojiEmail || dalPostojiUser) res.render('register', {
              title: "Register",
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
                            client.query(`insert into korisnik(ime, prezime, userrname, password, email, id_uloge, id_adrese) values ($1,$2,$3,$4,$5,4,$6);`,
                                [name,prezime,username,hashedPassword,email,index],function (err,result2){
                                  done();
                                  if(err){
                                    console.log("Došlo do greške pri insert upitu.");
                                  }else{
                                    res.redirect('/');
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
                              res.render('register', {
                                title: "Register",
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
                                                    client.query(`insert into korisnik(ime, prezime, userrname, password, email, id_uloge, id_adrese) values ($1,$2,$3,$4,$5,4,$6);`,
                                                        [name,prezime,username,hashedPassword,email,result4.rows[0].id],
                                                        function(err,result5){
                                                          if(err){
                                                            console.info("Došlo je do greške pri upitu.");
                                                          }else{
                                                            errors.push({succes: "Uspješno ste se registrovali"});
                                                            res.render('login',{
                                                              title: 'Login',
                                                              errors
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

router.post('/login',redirectHome,function (req,res,next){
  let errors=[];
  console.log(req.body);
  const{username,password}=req.body;
  if(!username || !password){
    errors.push({msg: "Niste unijeli username ili password"});
  }
  pool.connect(function (err, client, done) {
    if (err) {
      res.end('{"error" : "Error", "status" : 500}');
    }
    client.query("SELECT * FROM korisnik;", [], function(err, result) {
      done();

      if (err) {
        console.info(err);
        res.sendStatus(500);
      } else {
        let userId=0;
        let user_uloga=0;
        let dalPostojiUser=false;
        let user1,password1='';
        for(let i=0;i<result.rows.length;i++){
          if(username===result.rows[i].userrname){
            dalPostojiUser=true;
            user1=result.rows[i].userrname;
            password1=result.rows[i].password;
            userId=result.rows[i].id;
            user_uloga=result.rows[i].id_uloge;
            break;
          }
        }
        if(!dalPostojiUser) errors.push({msg: "Ne postoji username"});
        let results=passwordHash.verify(password,password1);
        if(!results){
          errors.push({msg: "Passwordi se ne poklapaju"});
          res.render('login',{
            title:"Login",
            errors
          });
        }
        else{
          req.session.userID=userId;
          req.session.user_uloga=user_uloga;
          console.log(user_uloga+" "+userId);
          res.redirect('/users/korisnik');
        }

      }
    });
  });

});
router.post('/logout',redirectLogin,function (req,res,next){
  console.log("Usao sam");
  req.session.destroy(function (err){
    if(err){
      res.redirect('/users/ispis');
    }
    let errors=[];
    errors.push({succes:"Uspješno ste se log outovali!"});
    res.clearCookie('sid');
    res.render('login',{
      title:"Login",
      errors
    });
  });
});

module.exports = router;
