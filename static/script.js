let botName = 'Alan';
let date = new Date();
date.setDate(date.getDate()-1);

let API_KEY = 'cq6zXadT6zQ1dXdiCECtLNEoSLVemAdnJmgGpLRo';
let datestring = date.getFullYear()+ '-' +('0'+(date.getMonth()+1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);

let marketNewsApi = `https://api.marketaux.com/v1/news/all?exchanges=NSE&filter_entities=true&limit=3&published_after=${datestring}&api_token=${API_KEY}`;

let STOCK_API_KEY = 'MKGFSFSI50KKG7OS';
let stockSearchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&`;
let stockPriceUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&`;




document.getElementById('currentchat').addEventListener('keydown', (event)=>{
  
  if (event.key==='Enter') {
  let msg=event.target.value;

  let messagelist = document.getElementById('messagelist');
  messagelist.style.color = 'white';
  let userdiv = document.createElement('div');
  userdiv.className = 'messageContainer';

  userdiv.style.textAlign='justify';
  userdiv.style.alignItems = 'flex-end';

  let textDiv = document.createElement('div');
  textDiv.className = 'message';
  textDiv.style.maxWidth = '70%';
  textDiv.appendChild(document.createTextNode(msg));


  userdiv.appendChild(textDiv);
  messagelist.appendChild(userdiv);
  messagelist.scrollTo(0,messagelist.scrollHeight);
  document.getElementById('currentchat').value='';


  let botdiv = document.createElement('div');
  botdiv.className = 'messageContainer';
  botdiv.style.maxWidth='70%';
  botdiv.style.whiteSpace='pre-wrap';
  botdiv.style.alignItems = 'flex-start';
  
  xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
 
    if (this.readyState==4 && this.status==200) {
      var response = JSON.parse(this.responseText);
     
      let tag = response.tag;
      let reply = response.message;
      if (tag ==='name') reply += botName;
      if (tag ==='Market news') {

        fetch(marketNewsApi)
        .then(response => response.json())
        .then(data => {
          let divTag = document.createElement('div');
          // console.log(data);
          for (let article of data['data']) {
            let aTag = document.createElement('a');
          
            aTag.setAttribute('href', article.url);
            aTag.setAttribute('target', '_blank');
            aTag.innerText = article.title;

            aTag.style.textDecoration = 'none';
            aTag.style.color = 'white';

            divTag.appendChild(aTag);
            divTag.appendChild(document.createElement('br'));
            divTag.appendChild(document.createElement('br'));
          }
          
          
          divTag.className = 'bot';
          divTag.style.maxWidth = '70%';
          divTag.style.paddingLeft = '2%';
          messagelist.appendChild(divTag);
          messagelist.scrollTo(0,messagelist.scrollHeight);
        });
      }


      let botTextDiv = document.createElement('div');
      botTextDiv.classList.add('bot', 'message');
      botTextDiv.appendChild(document.createTextNode(reply));


      botdiv.appendChild(botTextDiv);
      messagelist.appendChild(botdiv);

      if (tag==='stock price') {
        
        let divTag = document.createElement('div');
        
        let searchbar = document.createElement('input');
        searchbar.type="text";
        searchbar.style.border = 'none';
        searchbar.style.borderBottom = '2px solid blueviolet'
        
        searchbar.style.marginBottom = '10px';
        searchbar.style.outline = 'none';
        searchbar.style.color = 'white';
        searchbar.style.backgroundColor = 'black';

        searchbar.placeholder="type stock name";
        searchbar.addEventListener('keyup', (event) => {
          if ((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 97 && event.keyCode <= 121) || (event.keyCode == 229) ) {
           
            let searchText = searchbar.value;
            
            if (searchText.length>1 && searchText.length < 20) {
              fetch(stockSearchUrl+`keywords=${searchText}&apikey=${STOCK_API_KEY}`)
              .then(response => response.json())
              .then(data => {
                let MAX_LOOKUP = 3; // news api only allowing 3 results for free
                const searchResults = [];

                for (let i = 0; i < data['bestMatches'].length && i < MAX_LOOKUP; i++) {
                  searchResults.push(data['bestMatches'][i]['1. symbol'])
                }
               
                // To show recommendations under search bar
                let resultDiv = document.createElement('div');
                
                resultDiv.style.fontSize = '14px';
                resultDiv.style.display = 'flex';
                resultDiv.style.flexWrap = 'wrap';
                resultDiv.style.marginTop = '8px';

                for (let i = 0; i < searchResults.length; i++) {
                  let text = document.createElement('a');
                  text.setAttribute('href', '#');
                  text.style.textDecoration = 'none';
                  text.style.color = 'white';
                  text.style.border = '1px solid blueviolet';
                  text.style.borderRadius = '10px';
                  text.style.padding = '5px';
                  text.style.marginTop = '5px';
                  text.style.marginLeft = '5px';
                  // text.className = 'symbolName';

                  text.addEventListener('click', (event) => {
                    // console.log(event.target.innerText);
                    let symbolName = event.target.innerText;

                    fetch(stockPriceUrl+`symbol=${symbolName}&apikey=${STOCK_API_KEY}`)
                    .then(response => response.json())
                    .then(data => {
                      let DATE_LENGTH = 10;   // data length in returned object
                      let lastRefereshDate = (data['Meta Data']['3. Last Refreshed']).slice(0,DATE_LENGTH);
                      
                      let openPrice = data['Time Series (Daily)'][lastRefereshDate]['1. open'];
                      let closePrice = data['Time Series (Daily)'][lastRefereshDate]['4. close'];
                      let lowPrice = data['Time Series (Daily)'][lastRefereshDate]['3. low'];
                      let highPrice = data['Time Series (Daily)'][lastRefereshDate]['2. high'];
                     
                      let pTag = document.createElement('p');
                     
                      pTag.classList.add('bot', 'message');
                      pTag.style.maxWidth = '70%';
                      let priceData = `${symbolName}:<br><br>
                      Open price: ${openPrice}<br><br>
                      Close price: ${closePrice}<br><br>
                      Today's low: ${lowPrice}<br><br>
                      Today's high: ${highPrice}`;

                      pTag.innerHTML = priceData;
                      messagelist.removeChild(messagelist.lastChild);
                      messagelist.removeChild(messagelist.lastChild);
                      messagelist.appendChild(pTag);
                      messagelist.scrollTo(0,messagelist.scrollHeight);


                    });
                  });
                  text.innerText = searchResults[i];
                  text.style.marginLeft = '3px';
                  resultDiv.appendChild(text);
                }

                divTag.removeChild(divTag.lastChild);
                divTag.appendChild(resultDiv);
                messagelist.appendChild(divTag);
                searchbar.focus();
                messagelist.scrollTo(0,messagelist.scrollHeight);
                
              })

            }
          }
        });
        divTag.appendChild(searchbar);
        divTag.appendChild(document.createElement('div'));
        messagelist.appendChild(divTag);
        searchbar.focus();
        messagelist.scrollTo(0,messagelist.scrollHeight);
        
      }
      messagelist.scrollTo(0,messagelist.scrollHeight);
    }
  };
    xhttp.open('POST', '/predict', true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({message: msg}))
  }
})