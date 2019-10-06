const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const sheetId = '1lAPRHAehk88HTLrygO4BzZkXt4hvmnZEFkcWXqOMx3M';

// Global var where all the sheets will be accesable

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Class Data!A2:E',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      console.log('Name, Major:');
      // Print columns A and E, which correspond to indices 0 and 4.
      rows.map((row) => {
        console.log(`${row[0]}, ${row[4]}`);
      });
    } else {
      console.log('No data found.');
    }
  });
}

module.exports.updateCell = async(cell,value)=>
{
    return new  Promise(function(resolve, reject) {
        fs.readFile('credentials.json', (err, content) => {
          if (err) 
          {
            reject(err);
            //return console.log('Error loading client secret file:', err);
          }
            // Authorize a client with credentials, then call the Google Sheets API.
          authorize(JSON.parse(content), (auth)=>{
            let sheets = google.sheets({version: 'v4', auth});
            var request = {
                // The ID of the spreadsheet to update.
                spreadsheetId: sheetId,  // TODO: Update placeholder value.
                // The A1 notation of the values to update.
                range: cell,//'Sheet1!a1:a1',  // TODO: Update placeholder value.
                // How the input data should be interpreted.
                valueInputOption: 'RAW',  // TODO: Update placeholder value.
                resource: {'values': [[value]]},
            };
            sheets.spreadsheets.values.update(request, function(err, response) {
                if (err) {
                console.error(err);
                reject(err);
                }
                // TODO: Change code below to process the 'response' object:
                //console.log(JSON.stringify(response));
                sheets = null;
                resolve(JSON.stringify(response));
            });
          });
        });
     });
}

/**
  * Delete raw 
  * @param startRowIndex - index of the Previos row
  * @param endRowIndex - index of row to be deleted. How to find sheetId
  *     Look at google spreadsheet url:'https://docs.google.com/spreadsheets/d/1lAPRHAehk88HTLrygO4BzZkXt4hvmnZEFkcWXqOMx3M/edit#gid=0;
  *   the 'gid=0' at the end is ur sheetId = 0 according to this exmple
  * @Param sheetId - name if the sheet 'Sheet1'
  * @example if u want to delete Row 1st (startRowIndex = 0,endRowIndex = 1,sheetName)
  *        if u want to delete Row 2nd (startRowIndex = 1,endRowIndex = 2,sheetName)
  *       if u want to delete range Row (3 - 5) (startRowIndex = 2,endRowIndex = 5,sheetName)
  */
module.exports.deleteRow = async (startRowIndex,endRowIndex,sheetName) =>
{
    return new  Promise(function(resolve, reject) {
        fs.readFile('credentials.json', (err, content) => {
           if (err) 
          {
            reject(err);
            //return console.log('Error loading client secret file:', err);
          }
          authorize(JSON.parse(content), (auth)=>{
            let sheets = google.sheets({version: 'v4', auth});
             var request = {
                // The ID of the spreadsheet to update.
                spreadsheetId: sheetId,  // TODO: Update placeholder value.

                resource: {
                    "requests": 
                    [
                      {
                        "deleteRange": 
                        {
                          "range": 
                          {
                            "sheetId": sheetName, // gid
                            "startRowIndex": startRowIndex,
                            "endRowIndex": endRowIndex
                          },
                          "shiftDimension": "ROWS"
                        }
                      }
                    ]
                  }
              };
              sheets.spreadsheets.batchUpdate(request, function(err, response) {
                if (err) {
                    console.error(err);
                    return;
                }
                // TODO: Change code below to process the `response` object:
                console.log(JSON.stringify(response));
                });
          });
        });
    });        
              
}

module.exports.findRow = async (range,searchFor) =>
{
     return new  Promise(function(resolve, reject) {
        fs.readFile('credentials.json', (err, content) => {
          if (err) 
          {
            reject(err);
            //return console.log('Error loading client secret file:', err);
          }
          // Authorize a client with credentials, then call the Google Sheets API.
          authorize(JSON.parse(content), (auth)=>{
              //resolve(auth);
             let sheets = google.sheets({version: 'v4', auth});
              sheets.spreadsheets.values.get({
                 spreadsheetId: sheetId,
                 range: /*'Sheet1!A1:G'*/range,
                }, (err, res) => {
                    if (err) 
                    {
                        console.error(err);
                        reject(err);
                    }
                    const rows = res.data.values;
                    data = [];
                    let rowId = 0;
                    for (let i =0;i<rows.length;i++) {
                      let row = rows[i];
                      for (let j = 0;j < row.length;j++)
                      {
                        if (row[j] === searchFor)
                        { 
                          rowId = i+1;
                          break;
                        }
                      }// end for
                      if (rowId != 0)
                          break;// we found what we looking for                      
                    } // end for(let i =0;i<rows.length;i++)
                    console.log(" >>>> module.exports.findRow()[" + (rowId) + "]>>>>");
                    sheets = null;
                    resolve(rowId);
                });
              
              
              
              
          });
        });
    });
}
// will get first 5 proxies that date is 0 or 
// date diff is bigger then 24 hours
module.exports.get = async (minProxyRequest = 5)=>
{
    return new  Promise(function(resolve, reject) {
        fs.readFile('credentials.json', (err, content) => {
          if (err) 
          {
            reject(err);
            //return console.log('Error loading client secret file:', err);
          }
          // Authorize a client with credentials, then call the Google Sheets API.
          authorize(JSON.parse(content), (auth)=>{
              //resolve(auth);
             let sheets = google.sheets({version: 'v4', auth});
              sheets.spreadsheets.values.get({
                 spreadsheetId: sheetId,
                 range: 'Sheet1!A1:H',
                }, (err, res) => {
                    if (err) 
                    {
                        console.error(err);
                        reject(err);
                    }
                    const rows = res.data.values;
                    data = [];
                    var cnt = 0;
                    for (let i =0;i<rows.length;i++) {
                      let row = rows[i];
                      if ((typeof row[7] === 'undefined' || row[7] !== '1')
                           && (typeof row[6] === 'undefined'
                            || row[6] == "" ||
                                Math.abs(Date.now() - new Date(row[6]).getTime()) > (1000 * 3600 * 25)))
                                {
                                   let  proxyObj = {};
                                   proxyObj.ipAddress = row[0];
                                   proxyObj.port = row[1];
                                   proxyObj.protocols = row[2];
                                   /*proxyObj.anonymityLevel = row[2];
                                   proxyObj.protocols = row[3];
                                   proxyObj.country = row[4];
                                   proxyObj.source = row[5];
                                   */
                                   data.push(proxyObj);
                                   let rowId = (i+1);
                                   module.exports.updateCell('Sheet1!G'+rowId+":G" + rowId,new Date().toString());
                                   cnt++;
                                   if (cnt > minProxyRequest)
                                       break;
                                }// end if (typeof row[6] === 'undefined'
                    } // end for(let i =0;i<rows.length;i++)
                    console.log(" >>>> module.exports.get()[" + (data.length) + "]>>>>");
                    sheets = null;
                    resolve(data);
                });
              
              
              
              
          });
        });
    });
}
module.exports.appendRows = (data)=>{
    return new  Promise(function(resolve, reject) {
        fs.readFile('credentials.json', (err, content) => {
          if (err) 
          {
            reject(err);
            //return console.log('Error loading client secret file:', err);
          }
          // Authorize a client with credentials, then call the Google Sheets API.
          authorize(JSON.parse(content), (auth)=>{
              //resolve(auth);
             let sheets = google.sheets({version: 'v4', auth});
              sheets.spreadsheets.values.append({
                 spreadsheetId: sheetId,
                 range: 'Sheet1!A1',
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: data
                },
                }, (err, response) => {
                    if (err) 
                    {
                       console.error(err);
                       reject(err);
                    }
                    resolve();
                });
                sheets = null;
              console.log(" >>>> AFTER .... initSheets( ....)>>>>");  
          });
        });
    });
}

//(async() => {initSheets();})();
