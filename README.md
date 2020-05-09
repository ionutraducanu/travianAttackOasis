This tool is checking your UNREAD reports and will analyze them if are good to raid or not.

An array of reports will be dumped at the end of each iteration with occupied oasis.

After sending an attack the report will be deleted from the list.

Currently is sending an amount of troops from the first position, so it's good only for Romans (legionaries) and Teutons (clubs)

# Requirements
- Node.js


# Configuration
```bash
TRAVIAN_NAME= // username/email login detail
TRAVIAN_PASSWORD= 
TRAVIAN_SERVER=ts3 // server from URL name [https://ts3.travian.com/dorf1.php]
TRAVIAN_RAID_TROOPS=2 // troops sent per raid
TRAVIAN_RAID_BUTTON=Raid unoccupied oasis // because of no ID to match the button we match on text, if you have other language please change with the text of the button
```

# Installation
Duplicate .env.example to .env file and replace with your data and then:
```bash
npm install
```

## Usage


```bash
node index.js
```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
