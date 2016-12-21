let _ = require('lodash');
let a = [1,2,3,4];
let b = [2];
let isOk = _.some(a, (a0) => {
    console.log(a0);
    return b.includes(a0);
});
console.log(isOk);