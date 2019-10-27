/**
 * What this will do:
 * -- Start proxy scraper
 * --- Find proxies
 * --- Save Proxy to google spreadsheet
 * -- Get proxies from google spreadsheet, that are not used for the last 24 hours 
 * --- Update timestump of requested proxies in google spreadsheet , so next time
 *      we can filter for proxies that are not used for last 24 hours
 */
let express = require( 'express' ) ;
let bodyParser     =        require("body-parser");
let app = express() ;
// start proxy process
//const proxy_scraper = require('./../proxy_server/proxy_scraper.js');
const sheets = require('./spreadsheet_auth.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get( '/',async (req, res, next) => {
    let countries = req.query.c; // country 
    let limit = req.query.l; // limit how many proxy to be served
    if (req.query.p)
    { // this flag must exist anything with a p = (anything 1 ... 5. whatever)
      // then we should know that we looking for proxies
      let sheetResult = {};
      if (!limit || parseInt(limit) == 0)
          limit = 5;
     if (req.query.r) // range
     {
         sheetResult = await sheets.getRange(parseInt(req.query.r),
                                    parseInt(limit-1));
     }else
     {
      
        if (req.query.row) // this is where timestamp for this request is stored
        { // to not return the same proxy for the next 24 hours default is 6(G)
          if (req.query.sh)
              sheetResult = await sheets.get(limit-1,parseInt(req.query.row),req.query.sh);
          else
            sheetResult = await sheets.get(limit-1,parseInt(req.query.row));
        }else
        {    
            if (req.query.sh)
              sheetResult = await sheets.get(limit-1,0,req.query.sh);
            else
                sheetResult = await sheets.get(limit-1);
        }
     }
     res.send(JSON.stringify(sheetResult)); 
      next();
    }else if (req.query.err)
    {
         let rowId = await sheets.findRow('Sheet1!A1:A',req.query.err.toString());
         if (rowId > 0)
         {
            await sheets.updateCell('Sheet1!H' + rowId,"1");  
            res.send('<b> Proxy [' + req.query.err + '] has been flaged as error and wont be serving' );
         }else
          res.send('<b> Can not update proies table');
      next();
    }
    else
        res.send(JSON.stringify([]));
});


// start the server in the port 8080 !
// change the port if not working when deploy
// to server
app.listen(((process.env.PORT) ? process.env.PORT : 8080), function () {
    console.log('Example app listening on port 8080. - ',process.env.PORT);
});

