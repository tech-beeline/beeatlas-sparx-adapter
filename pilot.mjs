
const zeroPad = (num, places) => String(num).padStart(places, '0')

const monPartition = (y,m)=>`

CREATE TABLE arch_metrics.PUT_SYSTEM_LOG_Y${y}_M${m} PARTITION OF arch_metrics.PUT_SYSTEM_LOG
	FOR VALUES FROM ('${y}-${zeroPad(m,2)}-01') TO ('${m<12?y:y+1}-${m<12?zeroPad(m+1,2):zeroPad(1,2)}-01');`;

const yPartition = (y)=>Array.from({length:12}, (_,i)=>monPartition(y,i+1)).join('');

//console.log( yPartition(2025));
for( let y=2025; y < 2031; y++){
    console.log( yPartition(y));
}