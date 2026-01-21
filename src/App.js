import './App.css';
//import g3Logo from './assests/G3.svg';
import addIcon from './assests/addIcon.svg';
import recentIcon from './assests/recentIcon.svg';
import docIcon from './assests/docIcon.svg';
import question from './assests/question.svg';
import homeIcon from './assests/homeIcon.svg';
import manageIcon from './assests/manageIcon.svg';
//import uploadBtn from './assests/upload.avg';
//import userIcon from './assets/user-icon.png';
//import gptImgLogo from './assets/chatg3Logo.svg';

function App() {
  return (
    <div className= "App">
      <div className="sideBar">
        <div className="upperSide">
             <div className="upperSideTop"><img src= "" alt= "Logo" className= "logo" /><span className="brand" >G3-GPT</span></div>
             <button className="midBtn"><img src= {addIcon} alt= "new chat" className= "addBtn" />New Chat</button>
       
            
            <div className ="upperSideBottom">
              <button className="generalBtn"><img src= {recentIcon} alt= "generalBtn"/>Recents</button>
              <button className="generalBtn"><img src= {docIcon} alt= "generalBtn"/>My Documents</button>
              <button className="generalBtn"><img src= {manageIcon} alt= "generalBtn"/>User Managment</button>

                
            </div>
        </div>
        <div className ="lowerSide">
            <button className="listItems"><img src= {homeIcon} alt= "listItemsBtn" className= "listitemsImg" />Home</button>
            <button className="listItems"><img src= {question} alt="listItemsBtn" className= "listitemsImg" />Questions?</button>
        </div>


        </div>
        <div className="main">
          <div className="chats">
            <div className="chat bot">
              <img className="chatImg" src="" alt="" /><p className="txt">Hello, my name is g3-gpt</p>
            </div>
            <div className="chat user">
              <img className="chatImg" src="" alt="" /><p className="txt">What is 2+2? </p>
            </div>


          </div>
          <div className="chatFooter">
            <div className="chatInput">
              <input type= "text" placeholder="Hello! How can I help you?" /><button className="upload"><img src= "" alt ="Upload" /></button>
            </div>
            <p>Created by Sleep Cravers</p>
          </div>



        </div>
      </div>
  );
}

export default App;
