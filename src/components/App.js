import '../App.css';
import Header from "./Header.js";
import Footer from "./Footer.js";
import EditProfilePopup from "./popup/EditProfilePopup.js";
import EditCardPopup from "./popup/EditCardPopup.js";
import EditAvatarPopup from "./popup/EditAvatarPopup.js";
import ImagePopup from "./popup/ImagePopup.js";
import Main from "./Main.js";
import Api from "../utils/Api.js";
import React, {useEffect, useState} from 'react';
import {Route, Redirect, Switch, useRouteMatch } from 'react-router-dom';
import {CurrentUserContext} from '../contexts/CurrentUserContext.js';
import FormValues from "../hooks/FormValues.js";
import ProtectedRoute from "./ProtectedRoute.js";
import Login from './Login.js';
import Register from './Register.js';
import { useParams, useHistory } from 'react-router-dom'; 
import InfoTooltip from "./popup/InfoTooltip"
import Auth from "../utils/Auth.js";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedEmale, setLoggedEmale] = useState("");
  const [stateInfoTooltip, swapStateInfoTooltip] = useState({open: false, status: false});
  const history = useHistory(); 
  const [stateEditProfile, swapStateEditProfile] = useState(false);
  const [stateEditCard, swapStateEditCard] = useState(false);
  const [stateEditAvatar, swapStateEditAvatar] = useState(false);
  const [stateCardImage, swapstateCardImage] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const { path, url } = useRouteMatch();

  useEffect(() => {
    Api.getInitialInfo().then(([user, initialCards]) => {
      setCurrentUser(user);
      setCards(initialCards);
    }).catch(err => {
      Api.enterError(err);
    });
  }, []);

  function handleCardLike(card, isLiked) {
     if (!isLiked) {
      Api.putLike(card._id).then((newCard) => {
          setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
     }).catch(err => {
      Api.enterError(err);
    });
    } else {
      Api.removeLike(card._id).then((newCard) => {
       setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
    }).catch(err => {
      Api.enterError(err);
    });
    }
  } 

  function handleCardDelete(card) {
    Api.deleteCard(card._id).then((res) => {
       setCards((state) => state.filter((item) => item._id !== card._id));
    }).catch(err => {
      Api.enterError(err);
    });
  } 

  function handleUserInfo({name, about}){
    Api.changeProfileInfo(name, about).then((res) => {
      setCurrentUser(res);
			closeAllPopups();
   }).catch(err => {
     Api.enterError(err);
   });
  }

  function handleAvatarInfo(avatar){
    Api.handleAvatar(avatar).then((res) => {
      setCurrentUser(res);
			closeAllPopups();
   }).catch(err => {
     Api.enterError(err);
   });
  }

  function handleAddCard({title, urlImg}){
    Api.addCard(title, urlImg).then((res) => {
      setCards([res, ...cards]); ;
			closeAllPopups();
   }).catch(err => {
     Api.enterError(err);
   });
  }

  function handleEditProfile () {
    swapStateEditProfile(true);
  }
  function handleEditCard () {
    swapStateEditCard(true);
  }
  function handleEditAvatar () {
    swapStateEditAvatar(true);
  }
  function handleCardImage (cardInfo) {
    swapstateCardImage(cardInfo);
  }

  function closeAllPopups () {
    swapStateEditProfile(false);
    swapStateEditCard(false);
    swapStateEditAvatar(false);
    swapstateCardImage(null);
    setValues({})
    swapStateInfoTooltip({open: false, status: false})
  }
  const {values, handleChange, setValues} = FormValues({});

  useEffect(() => {
		checkToken();
	}, [])

  function checkToken () {
    const jwt = localStorage.getItem('jwt'); 
    if (jwt){
      Auth.getToken(jwt)
      .then(res => {
          setLoggedIn(true);
          setLoggedEmale(res.data.email)
          history.push('/main');
      })
      .catch(err => {
        Auth.enterError(err)
     })
    }
  }

	function handleSubmitRegistry(email, pass) {
		Auth.singnup(email, pass)
      .then((res) => {if (res) {
        swapStateInfoTooltip({open: true, status: true})
        history.push('/sign-in');
      }}) 
      .catch(res =>{swapStateInfoTooltip({open: true, status: false}
      )}) 
	}
	
  function handleSubmitSignIn(email, pass) {
		Auth.signin(email, pass)
      .then((res) => {if (res) {
			  localStorage.setItem('jwt', res.token);
			  setLoggedEmale(email);
        setLoggedIn(true);
			  history.push('/main');
      }})
      .catch(res =>{swapStateInfoTooltip({open: true, status: false}
      )}) 
	}

  function handleSignOut() {
		localStorage.removeItem('jwt');
		history.push('/sign-in');
		setLoggedIn(false);
    setLoggedEmale('')
	} 

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="body">
        <div className="page">
        <Header loggedIn={loggedIn} loggedEmale={loggedEmale} onClose={handleSignOut}/>
          <Switch>
          <ProtectedRoute 
            path="/Main"
            component={Main}
            onEditProfile={handleEditProfile}
            onEditCard={handleEditCard}
            onEditAvatar={handleEditAvatar}
            onCardClick={handleCardImage}
            onClosePopup={closeAllPopups}
            cards={cards}
            handleLikeClick={handleCardLike}
            handleCardDelete={handleCardDelete}
            loggedIn={loggedIn}
          />
          <Route path="/Main">
            <Footer />
          </Route>
          <Route exact path="/">
            {false ? <Redirect to="/Main" /> : <Redirect to="/sign-in" />}
          </Route>
          <Route path="/sign-in"> 
            <Login onSubmit={handleSubmitSignIn} history={history} />
          </Route>
          <Route path="/sign-up">
            <Register onSubmit={handleSubmitRegistry} history={history} />
          </Route>
          </Switch>
        </div>
      </div>
      <ImagePopup cardInfo={stateCardImage} onClose={closeAllPopups}></ImagePopup>
      <EditProfilePopup  inputValues={values} setInputValues={setValues} handleInputValues={handleChange} onSubmit={handleUserInfo} namePopup={"profile"} titlePopup={"Редактировать профиль"} textSubmit={"Сохранить"} isOpen={stateEditProfile} onClose={closeAllPopups}></EditProfilePopup>
      <EditCardPopup inputValues={values} setInputValues={setValues} handleInputValues={handleChange} onSubmit={handleAddCard} namePopup={"card"} titlePopup={"Новое место"} textSubmit={"Создать"} isOpen={stateEditCard} onClose={closeAllPopups}></EditCardPopup>
      <EditAvatarPopup  handleInputValues={handleChange} onSubmit={handleAvatarInfo} namePopup={"avatar"} titlePopup={"Обновить аватар"} textSubmit={"Сохранить"} isOpen={stateEditAvatar} onClose={closeAllPopups}></EditAvatarPopup>
      <InfoTooltip status={stateInfoTooltip.status} isOpen={stateInfoTooltip.open} onClose={closeAllPopups}></InfoTooltip>
    </CurrentUserContext.Provider>
  );
};

export default App;
