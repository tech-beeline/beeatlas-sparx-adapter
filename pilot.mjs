
let sample = `
/**
 * @swagger
 *  this is test
 * @returns
 
 **/

`

const sample_2 = `/api/domains/{code}/subdomains/`

function main() {

    let path = sample_2
    let keys = [];
    let extraOffset = 0;

    const tt = /^\/api\/domain\/(?:([^\/]+?))\/?(?=\/|$)/gi
    const rx_tt = /{([^}]+)}/gi

    let res = sample_2.match(rx_tt)

    let result = [];

    for (const ttt in res) {
        result.push(ttt);
    }


    console.log(examples)
}

main();