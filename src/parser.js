const parse = require('csv-parse/lib/sync')
const fs = require('fs');
 
var contents = fs.readFileSync(process.cwd() + '/data/addresses.csv', 'utf8');

const getAddresses = () => {
    const records = parse(contents, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ';'
        })

    return records;
}

module.exports = getAddresses;
