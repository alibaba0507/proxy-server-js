"""Find and show 10 working HTTP(S) proxies."""
import sys
import asyncio

from proxybroker import Broker


async def show(proxies):
    while True:
        proxy = await proxies.get()
        if proxy is None:
            break
        print('Found proxy: %s' % proxy)


print(">>>> STARTING PYTHON >>>>")
try:
    proxies = asyncio.Queue()
    judges = ['http://httpbin.org/get?show_env',
                  'https://httpbin.org/get?show_env']
    #broker = Broker(proxies,timeout=8, max_conn=200, max_tries=3, verify_ssl=False,judges=judges)
    broker = Broker(proxies,judges=judges)
    types = ['CONNECT:80','HTTPS',('HTTP', ('High')),]
    countries = ['US', 'DE', 'FR']
    tasks = asyncio.gather(
        broker.find(types=types,countries=countries, strict=True, limit=50), show(proxies)
    )

    loop = asyncio.get_event_loop()
    loop.run_until_complete(tasks)
except:
    e = sys.exc_info()[0]
    print(">>>> ERROR PYTHON [" + e + "] >>>>")