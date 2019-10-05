const spawn = require("child_process").spawn;
const sheets = require('./spreadsheet_auth.js');
let limit = 10;
let types = "CONNECT:80 , HTTPS";
let countries = "us , ca , de , fr , uk";

function doRun()
{
    console.log(">>>> START doRun() >>>>");
    let proxies = collectProxies();
    proxies.then((result)=>{
       console.log("!!!!! BEFORE NEW doRUN() .... Cycle !!!!");
        doRun();
    },(done)=>{
        
    });
    
    
}

async function collectProxies()
{   try{
      console.log(" >>> start collectProxies >>>");
      const pythonProcess = spawn('python', ['./ProxyBroker/examples/basic_original.py']);
     return new Promise(function(resolve, reject) {
            pythonProcess.stdout.on('data', (data) => {
                console.log(data.toString());
                
                    let ln = data.toString().split('\r\n');
                    let dataRows = [];
                    for (let i = 0;i < ln.length;i++)
                    {
                        let proxy_names = ln[i].split('[')[1];
                        
                        if (typeof proxy_names === 'undefined')
                            continue;  
                        proxy_names = proxy_names.split(']')[0];
                        let proxy_port = ln[i].split(']')[1];
                        if (typeof proxy_port === 'undefined')
                            continue;   
                        
                        let proxy = proxy_port.split(':')[0];
                        let port = proxy_port.split(':')[1];   
                        port = port.split('>')[0];  
                        //console.log(" >>> Proxy[" + proxy.trim() + ":" + port + "]>>>");
                        
                        let row = [];   
                        row.push(proxy.trim());
                        row.push(port);
                        row.push(proxy_names);
                        dataRows.push(row);
                         
                    }
              
                if (dataRows.length > 0)
                {
                    sheets.appendRows(dataRows).then(()=>{
                        resolve(data);
                    },(err)=>{
                        console.log(">>>> ERROORRRO [" + err + "]>>");
                    });
                    //const results = await Promise.all([ret]);
                }else
                    resolve(data);
            })
     });
    }catch(err)
    {
         console.log(">>> ERROR [" + err + "]>>>");
    }
}


 (async() => {doRun();})();