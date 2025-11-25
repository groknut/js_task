

function handleForm(frm) 
{
let app = frm.closest('.app');
let result = app.querySelector('.app__result');

let fields = [
    'orgname',
    'fio',
    'position',
    'phone',
    'phone2',
    'address',
    'email'
];

let styleConfig = [
    {suffix:'_align', property:'textAlign'},
    {suffix:'_size', property:'fontSize'},
    {suffix:'_color', property:'color'}
];

fields.forEach(field=>{
    if (!frm[field]){
        return;
    }
    let r = result.querySelector('.visit-card__item--' + field);
    if (r){
        r.textContent = frm[field].value;
    }
    if (frm[field + '_visible']) {
            r.style.display = frm[field + '_visible'].checked ? '' : 'none';
    }

    styleConfig.forEach(c => {
        if (frm[field + c.suffix]) {
            r.style[c.property] = frm[field + c.suffix].value;
        }
    })

    /*
    if (frm[field + '_size']) {
        r.style.fontSize = frm[field + '_size'].value;
    }
    if (frm[field + '_color']) {
        r.style.color = frm[field + '_color'].value;
    }
    */
})
return false;
}
