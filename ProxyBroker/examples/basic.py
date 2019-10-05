"""Find and show 10 working HTTP(S) proxies."""
import traceback
import logging
import getopt, sys
import asyncio

from proxybroker import Broker
try:
    print('>>> START OF Baaic.py >>>>>')
    
    async def show(proxies):
        print(' LIMTI = %s' % limitProxy)
        if cnt is not None:
            print(*cnt) 
        while True:
            proxy = await proxies.get()
            if proxy is None:
                break
            print('Found proxy: %s' % proxy)

    #loop = asyncio.get_event_loop()
    proxies = asyncio.Queue()
    #broker = Broker(proxies)
    judges = ['http://httpbin.org/get?show_env',
              'https://httpbin.org/get?show_env']
    #providers = ['http://www.proxylists.net/', 'http://fineproxy.org/eng/fresh-proxies/']
    #providers = ['http://pubproxy.com/api/proxy']
    
    broker = Broker(
        proxies,
        judges=judges,loop=loop)
    
    '''
    broker = Broker(
        proxies, timeout=8, max_conn=200, max_tries=3, verify_ssl=False
        ,judges=judges)
    '''
    #types = [('HTTP', ('Anonymous','High')),'HTTPS','CONNECT:80' ]
    #types = ['CONNECT:80']
    countries = ['US', 'DE', 'FR']

    tasks = asyncio.gather(
        broker.find(types=['CONNECT:80','HTTPS'],countries=['us','ca','de','fr']
            , strict=True,limit=10), show(proxies)
    )
    loop = asyncio.get_event_loop()
    loop.run_until_complete(tasks)
except Exception as e:
    logging.error(traceback.format_exc())
