### Access Patterns

POST /portfolios
primary container
pk = portfolio#name
sk = NA
id = pk + sk

gsi1 container (table)
pk = "portfolio"
sk = name
id = pk + sk


GET /portfolios
query(pk="portfolio", sk="")
GET /portfolio/name
query(pk="portfolio", sk="name")

DEL /portfolio/<name>
query(pk="portfolio", sk="name")

PATCH /portfolio/<name> (update price, value and updatedAt)
query(pk="portfolio", sk="name")

POST /trades
primary container
pk = "trade"
sk = portfolioname#insertedAt
id = pk + sk

GET /trades
query(pk="trade", sk="")

GET /trades?portfolioname=name
query(pk="trade", sk=startsWith(name))

##################


### Access Patterns

POST /portfolios
portfolio container (table)
pk = portfolioName
id = portfolioName


GET /portfolios
getAll(container("portfolio"))

GET /portfolio/name
get(id=portfolioName)

DEL /portfolio/<name>
get(id=portfolioName)

PATCH /portfolio/<name>/asset/<symbol> (update price, value and updatedAt)
get(id=portfolioName)

POST /trades
trade container (table)
pk = portfolioname
sk = insertedAt
id = randomId

asset container
pk = portfolioname
sk = symbol
id = pk + sk

GET /trades
getAll(container("trade"))

GET /trades?portfolioname=name
query(pk=name)

## TODO

- add cosmosDBtrigger on notification table
- create slack channel for stocks-watch notifications
- update update-assets-job to run everyday. If first day of month calculate monthly change and insert monthlyReport notification