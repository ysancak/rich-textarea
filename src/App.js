import './App.scss';
import { useState, useRef } from 'react';
import Loader from "react-loader-spinner";

function App() {

  const textareaRef = useRef();
  const [settings, setSettings] = useState({ isLoading: false, interval: null });
  const [textareaContent, setTextareaContent] = useState({ blackListed: null, grayListed: null, undefined: null, phrase: '' });

  const requestAPI = async (text) => {
    setSettings({ ...settings, isLoading: true });
    await fetch("https://api.sikayetvar.com/dictionary/phrase/check", {  method: 'POST', body: JSON.stringify(text) })
    .then(res => res.json())
    .then(result => { 
      setTextareaContent({ ...result, phrase: result.phrase.replace(/["]/g, '') });
      modifyTextArea(result);
    })
    .catch(error => { console.log(error) })
    setSettings({ ...settings, isLoading: false });
  }

  const textareaOnChange = async (e) => {
    let text = e.target.textContent.replace(/^\s+|\s+$/g, '');
    setTextareaContent({ ...textareaContent, phrase: text });
    if(text.length <= 1){ return }
    if (settings.interval) { 
      clearTimeout(settings.interval); 
      setSettings({ ...settings, interval: null });    
    }
    setSettings({ ...settings, interval: setTimeout(() => requestAPI(text), 1000) });
  }

  const modifyTextArea = (result) => {
    const splitedPhrase = result.phrase.replace(/["]/g, '').split(' ');
    const { undefined, blackListed, grayListed } = result;

    let html = '';
    for (const word of splitedPhrase) {
      if(undefined?.find(e => e == word)){
        html += `<mark class="txtarea-u">${word}</mark>&nbsp;`;
      }else if(blackListed?.find(e => e == word)){
        html += `<mark class="txtarea-b">${word}</mark>&nbsp;`;
      }else if(grayListed?.find(e => e == word)){
        html += `<mark class="txtarea-g">${word}</mark>&nbsp;`;
      }else{
        html += `${word}&nbsp;`;
      }
    }

    textareaRef.current.innerHTML = html;

		var range,selection;
		if(document.createRange){
			range = document.createRange();
			range.selectNodeContents(textareaRef.current);
			range.collapse(false);
			selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		} else if(document.selection) { 
			range = document.body.createTextRange();
			range.moveToElementText(textareaRef.current);
			range.collapse(false);
			range.select();
		}
    
  }


  return (
    <div className="App">
        <div className="container">
          <div className="textarea" ref={textareaRef} contentEditable="true" spellCheck="false" placeholder="Buraya bir şeyler yazın..." suppressContentEditableWarning="true" onInput={textareaOnChange}></div>
          <div className="info-box">
            <div className="left">{`${textareaContent.phrase.length} karakter`}</div>
            <div className="right"><Loader type="TailSpin" visible={settings.isLoading} color="#2e38c6" height={25} width={25} /></div>
          </div>
        </div>
    </div>
  );
}

export default App;
