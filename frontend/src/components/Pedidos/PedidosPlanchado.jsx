import React, { useState, useEffect } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { Modal, Checkbox } from "antd";
import { BsFillLightningFill } from "react-icons/bs";
import { useAuth } from "../../hooks/auth/auth";

import {
  IssuesCloseOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  DropboxOutlined,
} from "@ant-design/icons";
import { formatDate } from "../../utils/format";
import ReactPaginate from "react-paginate";
import useSWR from "swr";
import api from "../../api/api";

function PedidosPlanchado() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const { cookies } = useAuth();
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [availableMachines, setAvailableMachines] = useState([]);
  const itemsPerPage = 10;
  const [showMachineName, setShowMachineName] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const fetcher = async () => {
    const response = await api.get("/ironQueue");
    return response.data;
  };

  const { data } = useSWR("ironQueue", fetcher);

  useEffect(() => {
    // Recuperar la máquina seleccionada de localStorage
    const storedMachine = localStorage.getItem("selectedMachine");
    if (storedMachine) {
      setSelectedMachine(JSON.parse(storedMachine));
    }
  }, []);

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
        return pedido.orderStatus === filtroEstatus;
      }
    });

    const textFiltered = filtered.filter((pedido) => {
      return (
        pedido.client.name.toLowerCase().includes(filtro.toLowerCase()) ||
        pedido.user.name.toLowerCase().includes(filtro.toLowerCase()) ||
        pedido.user.name.toLowerCase().includes(filtro.toLowerCase()) ||
        pedido.id_order.toString().includes(filtro)
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

  const handleSelectMachine = (machine) => {
    setSelectedMachine(machine);
  };

  const handleStartProcess = async () => {
    try {
      setLoading(true);

      // Obtener datos de las máquinas y estaciones de planchado
      const [ironsResponse] = await Promise.all([api.get("/ironStations")]);

      const allMachines = [...ironsResponse.data];

      setAvailableMachines(allMachines);
      setSelectedMachine(null);
      setSelectedPedido(pedido);
      setShowMachineName(true);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMachineSelection = async () => {
    try {
      if (!selectedPedido || !selectedMachine) {
        console.error("El pedido o la máquina seleccionada son indefinidos.");
        return;
      }

      // Modificar el estado local de la lavadora seleccionada
      const updatedMachines = availableMachines.map((machine) =>
        machine.id_ironStation === selectedMachine.id_ironStation
          ? { ...machine, freeForUse: false }
          : machine
      );
      setAvailableMachines(updatedMachines);

      await api.patch(`/ironStations/${selectedMachine.id_ironStation}`, {
        freeForUse: false,
      });
      const updatedPedidos = pedidos.map((p) =>
        p.id_order === selectedPedido.id_order
          ? { ...p, orderStatus: "inProgress" }
          : p
      );

      setPedidos(updatedPedidos);

      await api.patch(`/startIronQueue/${selectedPedido.id_ironEvent}`, {
        serviceStatus: "inProgress",
        fk_idIronStation: selectedMachine.id_ironStation,
        fk_idStaffMember: cookies.token,
      });

      await api.patch(`/orders/${selectedPedido.id_order}`, {
        orderStatus: "inProgress",
        assignedMachine: selectedMachine.id,
      });

      setShowMachineName(false);
      showNotification(`Pedido iniciado en ${selectedMachine.machineType}`);
      // Actualizar datos
    } catch (error) {
      console.error("Error al actualizar el pedido:", error);
    }
  };

  const handleFinishProcess = async () => {
    setLoading(true);

    if (!selectedPedido) {
      console.error("El pedido seleccionado es indefinido.");
      setLoading(false);
      return;
    }

    if (!selectedMachine) {
      console.error("No se ha seleccionado ninguna máquina.");
      setLoading(false);
      return;
    }
    try {
      // Actualizar localmente el estado del pedido a "finished"
      const updatedPedidos = pedidos.map((p) =>
        p.id_order === selectedPedido.id_order
          ? { ...p, orderStatus: "finished" }
          : p
      );
      setPedidos(updatedPedidos);

      // Actualizar en la base de datos el estado del pedido a "finished"
      await api.patch(`/orders/${selectedPedido.id_order}`, {
        orderStatus: "finished",
      });

      // Actualizar localmente el estado de la máquina a "freeForUse"
      const updatedMachines = availableMachines.map((machine) =>
        machine.id_ironStation === selectedMachine.id_ironStation
          ? { ...machine, freeForUse: true }
          : machine
      );
      setAvailableMachines(updatedMachines);

      await api.patch(`/finishIronQueue/${selectedPedido.id_ironEvent}`, {
        fk_idIronStation: selectedMachine.id_ironStation,
        fk_idStaffMember: cookies.token,
        // fk_serviceOrder: selectedPedido.id_serviceOrder, 
      });

      // Actualizar en la base de datos el estado de la máquina a "freeForUse"
      await api.patch(`/ironStations/${selectedMachine.id_ironStation}`, {
        freeForUse: true,
      });

      setShowMachineName(false);
      showNotification("NOTIFICACIÓN ENVIADA...");
      await api.post("/sendMessage", {
        id_order: selectedPedido.id_order,
        name: selectedPedido.client.name,
        email: selectedPedido.client.email,
        tel: "521" + selectedPedido.client.phone,
        message: `Tu pedido con el folio: ${selectedPedido.id_order} está listo, Ya puedes pasar a recogerlo.`,
        subject: "Tu Ropa esta Lista",
        text: `Tu ropa esta lista, esperamos que la recojas a su brevedad`,
        warning: false,
      });
      console.log("NOTIFICACIÓN ENVIADA...");
      showNotification(`Pedido finalizado correctamente`);
      showNotification(`Pedido finalizado`);
    } catch (error) {
      console.error("Error al finalizar el pedido:", error);
    }
  };

  return (
    <div>
      <div className="mb-3">
        <div className="title-container">
          <strong className="title-strong">Pedidos de Planchado</strong>
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
            value="inProgress"
            className="text-yellow-600 font-semibold text-base"
          >
            En Proceso
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
              <th>Piezas</th>
              <th>Fecha de Entrega</th>
              <th>Estatus</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos
              .filter(
                (pedido) =>
                  pedido.orderStatus !== "finished" &&
                  pedido.orderStatus !== "delivered"
              ) // Filtrar pedidos que no tienen estado "finished"
              .slice(startIndex, endIndex)
              .map((pedido) => (
                <tr key={pedido.id_order}>
                  <td className="py-3 px-1 text-center">{pedido.id_order}</td>
                  <td className="py-3 px-6 font-medium text-gray-900">
                    {pedido.user.name} <br /> {pedido.user.firstLN}
                  </td>
                  <td className="py-3 px-6 font-medium text-gray-900">
                    {pedido.client.name} <br /> {pedido.client.firstLN}
                  </td>
                  <td className="py-3 px-6">
                    {pedido.category.categoryDescription === "planchado"
                      ? "Planchado"
                      : pedido.category.categoryDescription}
                    {pedido.category.categoryDescription === "planchado" &&
                      pedido.express && <BsFillLightningFill />}
                  </td>

                  <td className="py-3 px-6">
                    {pedido.ironPieces !== null ? pedido.ironPieces : "0"}
                  </td>
                  <td className="py-3 px-6">
                    {formatDate(pedido.scheduledDeliveryDate)}
                  </td>
                  <td className="py-3 px-6 font-bold ">
                    {pedido.orderStatus === "pending" ? (
                      <span className="text-gray-600 pl-1">
                        <MinusCircleOutlined /> Pendiente
                      </span>
                    ) : pedido.orderStatus === "stored" ? (
                      <span className="text-fuchsia-600 pl-1">
                        <DropboxOutlined /> Almacenado
                      </span>
                    ) : pedido.orderStatus === "inProgress" ? (
                      <span className="text-yellow-600 pl-1">
                        <ClockCircleOutlined /> En Proceso
                      </span>
                    ) : pedido.orderStatus === "finished" ? (
                      <span className="text-blue-600 pl-1">
                        <IssuesCloseOutlined /> Finalizado no entregado
                      </span>
                    ) : pedido.orderStatus === "delivered" ? (
                      <span className="text-green-600 pl-1">
                        <CheckCircleOutlined /> Finalizado Entregado
                      </span>
                    ) : (
                      <span className="text-red-600 pl-1">
                        <StopOutlined /> Cancelado
                      </span>
                    )}
                  </td>
                  <td>
                    {pedido.orderStatus === "pending" && (
                      <button
                        onClick={() => handleStartProcess(pedido)}
                        className="btn-primary ml-2 mt-1"
                      >
                        Iniciar
                      </button>
                    )}
                    {pedido.orderStatus === "inProgress" && (
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
                pedido.orderStatus !== "finished" &&
                pedido.orderStatus !== "delivered"
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
        open={showMachineName}
        onCancel={() => setShowMachineName(false)}
        footer={[
          <button
            key="submit"
            className="btn-primary"
            onClick={() => handleConfirmMachineSelection()}
            disabled={!selectedMachine}
          >
            Confirmar
          </button>,
          <button
            key="cancel"
            className="btn-primary-cancel ml-2"
            onClick={() => setShowMachineName(false)}
          >
            Cancelar
          </button>,
        ]}
        width={800}
        style={{ padding: "20px" }}
      >
        <div>
          <p className="mb-4 text-xl font-bold">Selecciona una máquina:</p>
          <table className="w-full text-center">
            <thead className="bg-gray-200">
              <tr>
                <th>Tipo de Máquina</th>
                <th>piezas</th>
                <th>Estado de la Máquina</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {availableMachines
                .filter((machine) => machine.status === "available")
                .map((machine) => (
                  <tr key={machine.id_ironStation}>
                    <td>{machine.machineType}</td>
                    <td>{machine.pieces}</td>
                    <td
                      className={`${
                        machine.freeForUse ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {machine.freeForUse ? "Libre" : "Ocupado"}
                    </td>

                    <td>
                      <div className="flex flex-col items-center">
                        <Checkbox
                          key={`checkbox_${machine.id_ironStation}`}
                          checked={selectedMachine === machine}
                          onChange={() => handleSelectMachine(machine)}
                          className="mb-2"
                          disabled={!machine.freeForUse}
                        />
                        <span className="text-blue-500">Seleccionar</span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Modal>

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
export default PedidosPlanchado;
