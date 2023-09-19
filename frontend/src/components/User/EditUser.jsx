import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?=!@#$%*]).{8,24}$/;

function EditUser() {
  const userRef = useRef();
  const errRef = useRef();

  const [userName, setUserName] = useState("");
  const [validUserName, setValidUserName] = useState(false);
  const [userNameFocus, setUserNameFocus] = useState(false);

  
  const [name, setName] = useState("");
  const [validName, setValidName] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [validFirstName, setValidFirstName] = useState(false);
  const [firstNameFocus, setFirstNameFocus] = useState(false);

  const [secondName, setSecondName] = useState("");
  const [validSecondName, setValidSecondName] = useState(false);
  const [secondNameFocus, setSecondNameFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rol, setRol] = useState("cajero");

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setValidUserName(USER_REGEX.test(userName));
  }, [userName]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [userName, pwd, matchPwd]);

  useEffect(() => {
    setValidName(USER_REGEX.test(name));
  }, [name]);

  useEffect(() => {
    setValidFirstName(firstName.trim().length > 0);
  }, [firstName]);

  useEffect(() => {
    setValidSecondName(secondName.trim().length > 0);
  }, [secondName]);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const getUserById = async () => {
      const response = await Axios.get(`http://localhost:5000/users/${id}`);
      setUserName(response.data.username);
      setName(response.data.name);
      setFirstName(response.data.firstName);
      setSecondName(response.data.secondName);
      setPwd(response.data.pass);
      setEmail(response.data.email);
      setPhone(response.data.phone);
      setRol(response.data.rol);
    };
    getUserById();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const v1 = USER_REGEX.test(userName);
    const v2 = PWD_REGEX.test(pwd);
    if (!v1 || !v2) {
      setErrMsg("Invalid Entry");
      return;
    }
    try {
      await Axios.patch(`http://localhost:5000/users/${id}`, {
        username: userName,
        name: name,
        userName: userName,
        firstName: firstName,
        secondName: secondName,
        email: email,
        phone: phone,
        rol: rol,
        pass: pwd,
      });

      setSuccess(true);

      setUserName("");
      setPwd("");
      setMatchPwd("");
      navigate("/login");
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 409) {
        setErrMsg("Username Taken");
      } else {
        setErrMsg("Registration Failed");
      }
      errRef.current.focus();
    }
  };

  return (
    <div className="signup-form">
      <div className="title-container">
        <p className="input-label">Editando perfil de:</p>   
        <strong className="title-strong">{userName}</strong>
      </div>
      {success ? (
        <section>
          <h1>Success!</h1>
          <p>
            <a href="/users">Usuarios</a>
          </p>
        </section>
      ) : (
        <section className="basic-container">
          <p
            ref={errRef}
            className={errMsg ? "errmsg" : "offscreen"}
            aria-live="assertive"
          >
            {errMsg}
          </p>
          <form onSubmit={handleSubmit}>
              {/**Nombre empleado */}
              <label className="input-label" htmlFor="name">
              Nombre del empleado
              {validName ? (
                <FontAwesomeIcon
                  icon={faCheck}
                  className="ml-3 text-green-500"
                />
              ) : (
                <FontAwesomeIcon icon={faTimes} className="err-icon" />
              )}
            </label>
            <input
              className="input-prim"
              type="text"
              id="name"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
              aria-invalid={validName ? "false" : "true"}
              onFocus={() => setNameFocus(true)}
              onBlur={() => setNameFocus(false)}
            />
            <label className="input-label" htmlFor="username">
              Nombre de usuario
              {validUserName ? (
                <FontAwesomeIcon
                  icon={faCheck}
                  className="ml-3 text-green-500"
                />
              ) : (
                <FontAwesomeIcon icon={faTimes} className="err-icon" />
              )}
            </label>
            <input
              className="input-prim"
              type="text"
              id="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUserName(e.target.value)}
              value={userName}
              required
              aria-invalid={validUserName ? "false" : "true"}
              aria-describedby="uidnote"
              onFocus={() => setUserNameFocus(true)}
              onBlur={() => setUserNameFocus(false)}
            />
            <div className="group">
              <p
                id="uidnote"
                className={`instructions ${
                  userNameFocus && userName && !validUserName ? "block" : "hidden"
                }`}
              >
                <FontAwesomeIcon icon={faInfoCircle} />De 4 a 24 caracteres.
                <br />
                Debera iniciar con una letra.                
                <br />
                Letras, numeros, guiones y guiones bajos estan permitidos.
              </p>
            </div>
             {/* First Name */}
            <label className="input-label" htmlFor="firstName">
              Apellido Paterno
              {validFirstName ? (
                <FontAwesomeIcon
                  icon={faCheck}
                  className="ml-3 text-green-500"
                />
              ) : (
                <FontAwesomeIcon icon={faTimes} className="err-icon" />
              )}
            </label>
            <input
              className="input-prim"
              type="text"
              id="firstName"
              autoComplete="off"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
              required
              aria-invalid={validFirstName ? "false" : "true"}
              onFocus={() => setFirstNameFocus(true)}
              onBlur={() => setFirstNameFocus(false)}
            />
            {/* Second Name */}
            <label className="input-label" htmlFor="secondName">
              Apellido Materno
              {validSecondName ? (
                <FontAwesomeIcon
                  icon={faCheck}
                  className="ml-3 text-green-500"
                />
              ) : (
                <FontAwesomeIcon icon={faTimes} className="err-icon" />
              )}
            </label>
            <input
              className="input-prim"
              type="text"
              id="secondName"
              autoComplete="off"
              onChange={(e) => setSecondName(e.target.value)}
              value={secondName}
              required
              aria-invalid={validSecondName ? "false" : "true"}
              onFocus={() => setSecondNameFocus(true)}
              onBlur={() => setSecondNameFocus(false)}
            />
            <label className="input-label" htmlFor="password">
              Contraseña:
              {validPwd ? (
                <FontAwesomeIcon
                  icon={faCheck}
                  className="ml-3 text-green-500"
                />
              ) : (
                <FontAwesomeIcon icon={faTimes} className="err-icon" />
              )}
            </label>
            <input
              className="input-prim"
              type="text"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
              aria-invalid={validPwd ? "false" : "true"}
              aria-describedby="pwdnote"
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
            />
            
            <div className="group">
              <p
                id="pwdnote"
                className={`instructions ${
                  pwdFocus && !validPwd ? "block" : "hidden"
                }`}
              >
                <FontAwesomeIcon icon={faInfoCircle} />De 8 a 24 caracteres.
                <br />
                Debera incluir al menos una Mayuscula, Minuscula, 
                un Número y un carácter Especial
                <br />
                Caracteres Especiale Permitidos:{" "}
                <span aria-label="exclamation mark">!</span>{" "}
                <span aria-label="at symbol">@</span>{" "}
                <span aria-label="hashtag">#</span>{" "}
                <span aria-label="dollar sign">$</span>{" "}
                <span aria-label="percent">%</span>
                <span aria-label="percent">?</span>
                <span aria-label="percent">=</span>
                <span aria-label="percent">*</span>
              </p>
            </div>

            <label className="input-label" htmlFor="confirm_pwd">
              Confirmar Contraseña:
              {validMatch && matchPwd ? (
                <FontAwesomeIcon
                  icon={faCheck}
                  className="ml-3 text-green-500"
                />
              ) : (
                <FontAwesomeIcon icon={faTimes} className="err-icon" />
              )}
            </label>
            <input
              className="input-prim"
              type="text"
              id="confirm_pwd"
              onChange={(e) => setMatchPwd(e.target.value)}
              value={matchPwd}
              required
              aria-invalid={validMatch ? "false" : "true"}
              aria-describedby="confirmnote"
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
            />
            <div className="group">
              <p
                id="confirmnote"
                className={`instructions ${
                  matchFocus && !validMatch ? "block" : "hidden"
                }`}
              >
                <FontAwesomeIcon icon={faInfoCircle} /> 
                Debe coindicir con el primer campo de la contraseña.
              </p>
            </div>

            <div className="mt-3">
              <label className="input-label" htmlFor="email">
                Email:
              </label>
              <input
                className="input-2ry"
                type="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />

              <label className="input-label" htmlFor="phone">
                Telefono:
              </label>
              <input
                className="input-2ry"
                type="tel"
                id="phone"
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
                required
                pattern="[0-9]{3}[0-9]{3}[0-9]{4}"
              />

              <label className="input-label" htmlFor="rol">
                Rol:
              </label>
              <select
                className="select-prim"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                name="rol"
                id="rol"
              >
                <option value="cajero">Cajero</option>
                <option value="admin">Administrador</option>
              </select>
            
            <button
              className="btn-edit"
              disabled={!validName || !validPwd || !validMatch ? true : false}
              type='submit'
            >
              Actualizar
            </button>
            <button
              className="btn-cancel"
              onClick={() => navigate("/clients")}
            >
              Cancelar
            </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default EditUser;
