import React, { useState, useEffect } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { Modal, Checkbox } from "antd";
import useSWR from "swr";
import ReactPaginate from "react-paginate";
import api from "../../api/api";
import { formatDate } from "../../utils/format";
import { useAuth } from "../../hooks/auth/auth";

import {
  IssuesCloseOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  DropboxOutlined,
} from "@ant-design/icons";

function PedidosVarios() {
  const [pedidos, setPedidos] = useState([]);
  const { cookies } = useAuth();
  const [filtro, setFiltro] = useState("");
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [notificationMessage, setNotificationMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const fetcher = async () => {
    const response = await api.get("/laundryQueue");
    return response.data;
  };

  const { data } = useSWR("laundryQueue", fetcher);


  useEffect(() => {
    if (data) {
      setPedidos(data);
      setFilteredPedidos(data);
    }
  }, [data]);

  useEffect(() => {
    const filtered = pedidos.filter((pedido) => {
      if (filtroEstatus === "") {
        return true;
      } else {
        return pedido.serviceStatus === filtroEstatus;
      }
    });

    const textFiltered = filtered.filter((pedido) => {
      return (
        pedido.serviceOrder.client.name
          .toLowerCase()
          .includes(filtro.toLowerCase()) ||
        pedido.serviceOrder.user.name
          .toLowerCase()
          .includes(filtro.toLowerCase()) ||
        pedido.serviceOrder.user.name
          .toLowerCase()
          .includes(filtro.toLowerCase()) ||
        pedido.id_laundryEvent.toString().includes(filtro)
      );
    });

    setFilteredPedidos(textFiltered);
  }, [filtro, filtroEstatus, pedidos]);

  if (!data) return <h2>Loading...</h2>;
  const handleFiltroChange = (event) => {
    setFiltro(event.target.value);
  };

  const handleFiltroEstatusChange = (event) => {
    setFiltroEstatus(event.target.value);
  };

  const showNotification = (message) => {
    setNotificationMessage(message);
    setNotificationVisible(true);

    setTimeout(() => {
      setNotificationVisible(false);
    }, 2000);
  };

  const handleStartProcess = async (pedido) => {
    try {
      setLoading(true);

      const updatedPedidos = pedidos.map((p) =>
      p.id_laundryEvent === selectedPedido.id_laundryEvent
        ? { ...p, serviceStatus: "inProgress" }
        : p
    );

    setPedidos(updatedPedidos);



    await api.patch(`/orders/${selectedPedido.fk_idServiceOrder}`, {
      orderStatus: "inProgress",
    });

      setSelectedPedido(pedido);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishProcess = async (pedido) => {

    try {

      if (!pedido) {
        console.error("El pedido seleccionado es indefinido.");
        return;
      }

    
      // const res = await api.get(`/laundryQueueById/${pedido.id_laundryEvent}`)
      // const selectedDryMachine = res.data.DryDetail

      // if (selectedDryMachine) {
      //   // Liberar la secadora seleccionada
      //   if (selectedDryMachine) {
      //     const updatedDryers = availableMachines.map((machine) =>
      //       machine.id_machine === selectedDryMachine.fk_idDryMachine
      //         ? { ...machine, freeForUse: true }
      //         : machine
      //     );
      //     setAvailableMachines(updatedDryers);

          // También actualizar la base de datos
          const res = await api.patch(`/finishLaundryQueue/${pedido.id_laundryEvent}`, {
            fk_idStaffMember: cookies.token,
          });

          // Actualizar el estado del pedido a "finish"
          const updatedPedido = { ...pedido, serviceStatus: "finished" };
          const updatedPedidos = pedidos.map((p) =>
            p.id_laundryEvent === pedido.id_laundryEvent ? updatedPedido : p
          );
          setPedidos(updatedPedidos);


          if (res.data.orderStatus === 'finished') {
            showNotification("Pedido finalizado correctamente, NOTIFICACIÓN ENVIADA...");
            await api.post("/sendMessage", {
              id_order: pedido.fk_idServiceOrder,
              name: pedido.serviceOrder.client.name + ' ' + pedido.serviceOrder.client.firstLN + ' ' + pedido.serviceOrder.client.secondLN,
              email: pedido.serviceOrder.client.email,
              tel: "521" + pedido.serviceOrder.client.phone,
              message: `Tu pedido con el folio: ${pedido.fk_idServiceOrder} está listo, Ya puedes pasar a recogerlo.`,
              subject: "Tu Ropa esta Lista",
              text: `Tu ropa esta lista, esperamos que la recojas a su brevedad`,
              warning: false,
            });
            console.log("NOTIFICACIÓN ENVIADA...");
          } else {
            showNotification(`Tarea del Pedido finalizada correctamente`);
          }
        
    } catch (err) {
      console.log(err)
    }
  };

  return (
    <div>
      <div className="mb-3">
        <div className="title-container">
          <strong className="title-strong">Pedidos de Lavanderia</strong>
        </div>
      </div>
      <div className="flex items-center mb-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar..."
            className="input-search"
            value={filtro}
            onChange={handleFiltroChange}
          />
          <div className="absolute top-2.5 left-2.5 text-gray-400">
            <HiOutlineSearch fontSize={20} className="text-gray-400" />
          </div>
        </div>
        <select
          className="select-category"
          value={filtroEstatus}
          onChange={handleFiltroEstatusChange}
        >
          <option className="text-base font-semibold" value="">
            Todos
          </option>
          <option
            value="pending"
            className="text-gray-600 font-semibold text-base"
          >
            Pendientes
          </option>
          <option
            value="inProgressWash"
            className="text-Cerulean font-semibold text-base"
          >
            En Proceso de Lavado
          </option>
          <option
            value="inProgressDry"
            className="text-yellow-600 font-semibold text-base"
          >
            En Proceso de Secado
          </option>
          <option
            value="finished"
            className="text-blue-600 font-semibold text-base"
          >
            Finalizados
          </option>
          <option
            value="delivered"
            className="text-green-600 font-semibold text-base"
          >
            Entregados
          </option>
          <option
            value="stored"
            className="text-fuchsia-600 font-semibold text-base"
          >
            Almacenados
          </option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200">
            <tr>
              <th>No. Folio</th>
              <th>Recibió</th>
              <th>Cliente</th>
              <th>Detalles</th>
              <th>Fecha de Entrega</th>
              <th>Estatus</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos
              .filter(
                (pedido) =>
                  pedido.serviceStatus !== "finished" &&
                  pedido.serviceStatus !== "delivered"
              ) // Filtrar pedidos que no tienen estado "finished"
              .slice(startIndex, endIndex)
              .map((pedido) => (
                <tr key={pedido.id_laundryEvent}>
                  <td className="py-3 px-1 text-center">
                    {pedido.id_description}
                  </td>
                  <td className="py-3 px-6 font-medium text-gray-900">
                    {pedido.serviceOrder.user.name} <br />{" "}
                    {pedido.serviceOrder.user.firstLN}
                  </td>

                  <td className="py-3 px-6 font-medium text-gray-900">
                    {pedido.serviceOrder.client.name} <br />{" "}
                    {pedido.serviceOrder.client.firstLN}
                  </td>
                  <td className="py-3 px-6">
                    {pedido.LaundryService.description}
                  </td>

                  <td className="py-3 px-6">
                    {formatDate(pedido.LaundryService.created)}
                  </td>
                  <td className="py-3 px-6 font-bold ">
                    {pedido.serviceStatus === "pending" ? (
                      <span className="text-gray-600 pl-1">
                        <MinusCircleOutlined /> Pendiente
                      </span>
                    ) : pedido.serviceStatus === "stored" ? (
                      <span className="text-fuchsia-600 pl-1">
                        <DropboxOutlined /> Almacenado
                      </span>
                    ) : pedido.serviceStatus === "inProgressWash" ? (
                      <span className="text-Cerulean pl-1">
                        <ClockCircleOutlined /> En Proceso de Lavado
                      </span>
                    ) : pedido.serviceStatus === "inProgressDry" ? (
                      <span className="text-yellow-600 pl-1">
                        <ClockCircleOutlined /> En Proceso de Secado
                      </span>
                    ) : pedido.serviceStatus === "finished" ? (
                      <span className="text-blue-600 pl-1">
                        <IssuesCloseOutlined /> Finalizado no entregado
                      </span>
                    ) : pedido.serviceStatus === "delivered" ? (
                      <span className="text-green-600 pl-1">
                        <CheckCircleOutlined /> Finalizado Entregado
                      </span>
                    ) : (
                      <span className="text-red-600 pl-1">
                        <StopOutlined /> Cancelado
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    {pedido.serviceStatus === "pending" && (
                      <button
                        onClick={() => handleStartProcess(pedido)}
                        className="btn-primary ml-2 mt-1"
                      >
                        Iniciar
                      </button>
                    )}
                    {pedido.serviceStatus === "inProgress" && (
                      <button
                        onClick={() => handleFinishProcess(pedido)}
                        className="btn-primary ml-2 mt-1"
                      >
                        Terminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center my-8">
        <ReactPaginate
          previousLabel="Anterior"
          nextLabel="Siguiente"
          breakLabel="..."
          pageCount={Math.ceil(
            filteredPedidos.filter(
              (pedido) =>
                pedido.serviceStatus !== "finished" &&
                pedido.serviceStatus !== "delivered"
            ).length / itemsPerPage
          )}
          marginPagesDisplayed={2}
          pageRangeDisplayed={2}
          onPageChange={handlePageChange}
          containerClassName="pagination flex"
          pageLinkClassName="pageLinkClassName"
          previousLinkClassName="prevOrNextLinkClassName"
          nextLinkClassName="prevOrNextLinkClassName"
          breakLinkClassName="breakLinkClassName"
          activeLinkClassName="activeLinkClassName"
        />
      </div>

      <Modal
        open={notificationVisible}
        footer={null}
        onCancel={() => setNotificationVisible(false)}
        destroyOnClose
      >
        <div className="text-center">
          <div style={{ fontSize: "36px", color: "#52c41a" }}>
            <CheckCircleOutlined />
          </div>
          <p>{notificationMessage}</p>
        </div>
      </Modal>
    </div>
  );
}

export default PedidosVarios;
