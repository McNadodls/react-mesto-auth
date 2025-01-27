import logo from '../images/logo/Vector.svg';
import React from 'react';
import {NavLink, Route, Switch} from 'react-router-dom'; 

function Header (props) {
  return(
  <header className="header">
    <img className="header__logo" src={logo} alt="Место Россия" />
      <nav className="header__links">
        <Switch>
        <Route path="/sign-in"><NavLink  to="/sign-up" className="header__link">Регистрация</NavLink></Route>
        <Route path="/sign-up"><NavLink  to="/sign-in" className="header__link">Войти</NavLink></Route>
        <Route path="/">
          <p className="header__email">{props.loggedEmale}</p> 
          <NavLink  to="/sign-in" onClick={props.onClose} className="header__link">Выйти</NavLink>
        </Route>
        </Switch>
     </nav>
  </header>
)
}
export default Header