/*
 * lib/historical-single.js
 */

'use strict';

var util = require('util'),
    fs = require('fs');
require('colors');

var yahooFinance = require('yahoo-finance'),
    startDate = '2013-1-01',
    endDate = '2013-12-26',
    allSymbols = [    
    'A','AA','AAPL','ABBV','ABC','ABT','ACE','ACN','ACT','ADBE','ADI','ADM','ADP','ADSK','ADT','AEE','AEP','AES','AET','AFL','AGN','AIG','AIV','AIZ','AKAM','ALL','ALTR','ALXN','AMAT','AME','AMGN','AMP','AMT','AMZN','AN','ANF','AON','APA','APC','APD','APH','ARG','ATI','AVB','AVP','AVY','AXP','AZO','BA','BAC','BAX','BBBY','BBT','BBY','BCR','BDX','BEAM','BEN','BF.B','BHI','BIIB','BK','BLK','BLL','BMS','BMY','BRCM','BRK.B','BSX','BTU','BWA','BXP','C','CA','CAG','CAH','CAM','CAT','CB','CBG','CBS','CCE','CCI','CCL','CELG','CERN','CF','CFN','CHK','CHRW','CI','CINF','CL','CLF','CLX','CMA','CMCSA','CME','CMG','CMI','CMS','CNP','CNX','COF','COG','COH','COL','COP','COST','COV','CPB','CRM','CSC','CSCO','CSX','CTAS','CTL','CTSH','CTXS','CVC','CVS','CVX','D','DAL','DD','DE','DFS','DG','DGX','DHI','DHR','DIS','DISCA','DLPH','DLTR','DNB','DNR','DO','DOV','DOW','DPS','DRI','DTE','DTV','DUK','DVA','DVN','EA','EBAY','ECL','ED','EFX','EIX','EL','EMC','EMN','EMR','EOG','EQR','EQT','ESRX','ESV','ETFC','ETN','ETR','EW','EXC','EXPD','EXPE','F','FAST','FCX','FDO','FDX','FE','FFIV','FIS','FISV','FITB','FLIR','FLR','FLS','FMC','FOSL','FOXA','FRX','FSLR','FTI','FTR','GAS','GCI','GD','GE','GILD','GIS','GLW','GM','GME','GNW','GOOG','GPC','GPS','GRMN','GS','GT','GWW','HAL','HAR','HAS','HBAN','HCBK','HCN','HCP','HD','HES','HIG','HOG','HON','HOT','HP','HPQ','HRB','HRL','HRS','HSP','HST','HSY','HUM','IBM','ICE','IFF','IGT','INTC','INTU','IP', 'IPG','IR','IRM','ISRG','ITW','IVZ','JBL','JCI','JCP','JDSU','JEC','JNJ','JNPR','JOY','JPM','JWN','K','KEY','KIM','KLAC','KMB','KMI','KMX','KO','KR','KRFT','KSS','KSU','L','LEG','LEN','LH','LIFE','LLL','LLTC','LLY','LM','LMT','LNC','LO','LOW','LRCX','LSI','LUK','LUV','LYB','M','MA','MAC','MAR','MAS','MAT','MCD','MCHP','MCK','MCO','MDLZ','MDT','MET','MHFI','MJN','MKC','MMC','MMM','MNST','MO','MON','MOS','MPC','MRK','MRO','MS','MSFT','MSI','MTB','MU','MUR','MWV','MYL','NBL','NBR','NDAQ','NE','NEE','NEM','NFLX','NFX','NI','NKE','NLSN','NOC','NOV','NRG','NSC','NTAP','NTRS','NU','NUE','NVDA','NWL','OI','OKE','OMC','ORCL','ORLY','OXY','PAYX','PBCT','PBI','PCAR','PCG','PCL','PCLN','PCP','PDCO','PEG','PEP','PETM','PFE','PFG','PG','PGR','PH','PHM','PKI','PLD','PLL','PM','PNC','PNR','PNW','POM','PPG','PPL','PRGO','PRU','PSA','PSX','PVH','PWR','PX','PXD','QCOM','QEP','R','RAI','RDC','REGN','RF','RHI','RHT','RL','ROK','ROP','ROST','RRC','RSG','RTN','SBUX','SCG','SCHW','SE','SEE','SHW','SIAL','SJM','SLB','SLM','SNA','SNDK','SNI','SO','SPG','SPLS','SRCL','SRE','STI','STJ','STT','STX','STZ','SWK','SWN','SWY','SYK','SYMC','SYY','T','TAP','TDC','TE','TEG','TEL','TER','TGT','THC','TIF','TJX','TMK','TMO','TRIP','TROW','TRV','TSN','TSO','TSS','TWC','TWX','TXN','TXT','TYC','UNH','UNM','UNP','UPS','URBN','USB','UTX','V','VAR','VFC','VIAB','VLO','VMC','VNO','VRSN','VRTX','VTR','VZ','WAG','WAT','WDC','WEC','WFC','WFM','WHR','WIN','WLP','WM','WMB','WMT','WPX','WU','WY','WYN','WYNN','X','XEL','XL','XLNX','XOM','XRAY','XRX','XYL','YHOO','YUM','ZION','ZMH' 
    ],
    indexToSplit = allSymbols.indexOf('IPG'),
    output = {
        "symbols" : {
        }, 
        "date": [
        ]
    }, 
    outputFileName = 'stocks.json',
    date = "",
    symbol = "",
    close = [];


yahooFinance.historical({
  symbols: allSymbols.slice(0, indexToSplit+1),
  from: startDate,
  to: endDate,
}, function (err, results) {
  if (err) { throw err; }
    for(var j=0; j< results[0]["quotes"].length; j++){
        date = results[0]["quotes"][j]["date"];
        output["date"].push(date);
    } 

    for(var i=0; i<results.length; i++){
        close = [];
        symbol = results[i]["symbol"];
        for(var j=0; j< results[0]["quotes"].length; j++){
             if(!results[i]["quotes"][j]){ 
                close.push(0);
            }else{
                close.push(results[i]["quotes"][j]["close"]);
            }

        }
        output["symbols"][symbol] = close;
    }
});


yahooFinance.historical({
  symbols: allSymbols.slice(indexToSplit+1),
  from: startDate,
  to: endDate
}, function (err, results) {
  if (err) { throw err; }
    for(var i=0; i<results.length; i++){
        close = [];
        symbol = results[i]["symbol"];
        for(var j=0; j< results[0]["quotes"].length; j++){
            if(!results[i]["quotes"][j]){ 
                close.push(0);
            }else{
                close.push(results[i]["quotes"][j]["close"]);
            }
        }
        output["symbols"][symbol] = close;
    }
    fs.writeFile(outputFileName, JSON.stringify(output, null, 4), function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + outputFileName);
        }
    }); 

});


