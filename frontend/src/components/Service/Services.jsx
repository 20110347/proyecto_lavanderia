import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import useSWR, { useSWRConfig } from "swr";

// Dialogs
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

function Services() {
  const [serviceSelDesc, setServiceSelDesc] = useState();
  const [serviceSelId, setServiceSelId] = useState();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate()

  const { mutate } = useSWRConfig();
  const fetcher = async () => {
    const response = await Axios.get("http://localhost:5000/services");
    return response.data;
  };

  const { data } = useSWR("services", fetcher);
  if (!data) return <h2>Loading...</h2>;

  const deleteService = async (serviceId) => {
    await Axios.delete(`http://localhost:5000/services/${serviceId}`);
    mutate("services");
  };

  const handleClickOpen = (serviceDesc, serviceId) => {
    setServiceSelId(serviceId);
    setServiceSelDesc(serviceDesc);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const deleteAndClose = (serviceId) => {
    handleClose();
    deleteService(serviceId);
  };

  return (
    <div>
      <div className="title-container">
        <strong className="title-strong">Servicios</strong>
      </div>
      <div className="w-full pt-4">
        <button onClick={() => navigate('/addService')} className="btn-primary">
          Añadir Nuevo Servicio
        </button>
        <div className="shadow-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Tiempo</th>
                <th>Peso</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((service, index) => (
                <tr key={service.id_service}>
                  <td>{index + 1}</td>
                  <td>{service.description}</td>
                  <td>${service.price}</td>
                  <td>{service.time} minutos</td>
                  <td>{service.weight} kg</td>
                  <td>
                    <button onClick={() => navigate(`/editService/${service.id_service}`)} className="btn-edit">
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        handleClickOpen(service.description, service.id_service)
                      }
                      className="btn-cancel"
                    >
                      Eliminar
                    </button>
                    <Dialog
                      open={open}
                      onClose={handleClose}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">
                        {"Eliminar el servicio"}
                      </DialogTitle>
                      <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                          ¿Deseas eliminar el servicio: {serviceSelDesc}?
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleClose}>Cancelar</Button>
                        <Button
                          onClick={() => deleteAndClose(serviceSelId)}
                          autoFocus
                        >
                          Eliminar
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Services;
