var moment = require('moment');

module.exports = {
    $: function (v1, operator, v2) {
        // e.g. {{#if ($ user.role '==' 'admin')}}, {{$ ($ 2 '%' 3) '+' 1}}
        switch (operator) {
            case '+':
                return v1 + v2;
            case '%':
                return v1 % v2;
            case '==':
                return (v1 == v2);
            case '===':
                return (v1 === v2);;
            case '!=':
                return (v1 != v2);
            case '!==':
                return (v1 !== v2);
            case '<':
                return (v1 < v2);
            case '<=':
                return (v1 <= v2);
            case '>':
                return (v1 > v2);
            case '>=':
                return (v1 >= v2);
            case '&&':
                return (v1 && v2);
            case '||':
                return (v1 || v2);
            case 'in':
                var arr = v2.split(',')
                return arr.indexOf(v1) > -1;
            case 'nin':
                var arr = v2.split(',')
                return arr.indexOf(v1) === -1;
            default:
                return false;
        }
    },
    section: function (name, options) {
        if (!this._sections) this._sections = {};
        this._sections[name] = options.fn(this);
        return null;
    },
    date: function (dateTime, format) {
        // e.g. {{date lastUpdated 'MMMM Do YYYY, h:mm:ss a'}}
        if (!dateTime || !format) {
            return dateTime;
        };

        return moment(dateTime).format(format);
    },
    number: function (num) {
        if (num == undefined) {
            return num;
        };

        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 2,
        }).format(num);
    },
}
