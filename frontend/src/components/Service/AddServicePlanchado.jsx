import React, { useRef, useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiOutlineExclamationCircle } from "react-icons/ai";

function AddServicePlanchado() {
  const descriptionRef = useRef();
  const priceRef = useRef();
  const timeRef = useRef();
  const weightRef = useRef();

  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("Planchado");

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const planchaduriaKeywords = ["planchado", "planchados", "planchaduría"];
  const forbiddenKeyword = ["autoservicio", "autoservicios", "auto servicios", "auto servicio"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasPlanchaduriaKeyword = planchaduriaKeywords.some((keyword) =>
      description.toLowerCase().includes(keyword)
    );

    if (!hasPlanchaduriaKeyword) {
      setErrMsg("Error, solo puedes añadir servicios de planchaduría.");
      return;
    }

    if (description.toLowerCase().includes(forbiddenKeyword)) {
        setErrMsg("Error, no puedes añadir servicios de 'autoservicio'.");
        return;
      }
  

    try {
      await Axios.post("http://localhost:5000/services", {
        description: description,
        price: parseFloat(price),
        category_id: 3,
      });
      setDescription("");
      setPrice(0);
      setCategory("Planchado");
      setSuccess(true);

      navigate("/servicesPlanchado");
    } catch (err) {
      setErrMsg("Failed to add service.");
    }
  };

  return (
    <div className="signup-form">
      <div className="form-container">
        <div className="HeadContent">
          <h2 className="title text-white">
            <em>Añadir un Servicio de Planchaduria </em>
          </h2>
          <p className="form-lbl text-white">Ingrese los detalles del Servicio.</p>
          <div className="clearBoth"></div>
        </div>
        {success ? (
          <section>
            <h1>Success!</h1>
          </section>
        ) : (
          <section>
            <form onSubmit={handleSubmit}>
              <label className="form-lbl" htmlFor="description">
                Descripción:
              </label>
              <input
                className="form-input"
                type="text"
                id="description"
                ref={descriptionRef}
                autoComplete="off"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                required
              />

              {errMsg && (
                <div className="error-message flex items-center mt-2 space-x-2">
                  <AiOutlineExclamationCircle
                    className="text-red-500"
                    style={{ fontSize: "1rem" }}
                  />
                  <p className="errmsg text-red-500 ">
                    {errMsg}
                  </p>
                </div>
              )}

              <label className="form-lbl" htmlFor="price">
                Precio Unitario:
              </label>
              <input
                className="form-input"
                type="number"
                step="0.1"
                id="price"
                ref={priceRef}
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                required
              />

              <label className="form-lbl" htmlFor="category">
                Categoría:
              </label>
              <input
                className="form-input"
                type="text"
                id="category"
                value="Planchado"
                disabled
              />

              <button className="btn-primary" type="submit">
                Añadir Servicio
              </button>
              <button
                className="btn-cancel"
                onClick={() => navigate("/servicesPlanchado")}
              >
                Cancelar
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}

export default AddServicePlanchado;