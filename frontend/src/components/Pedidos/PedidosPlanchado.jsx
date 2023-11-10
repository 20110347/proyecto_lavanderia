import React, { useState, useEffect } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { Modal, Checkbox } from "antd";
import {
  IssuesCloseOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  DropboxOutlined,
} from "@ant-design/icons";
import ReactPaginate from "react-paginate";
import useSWR from "swr";
import api from "../../api/api";

function PedidosPlanchado() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("");
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
    const response = await api.get("/ordersIron");
    return response.data;
  };

  const { data } = useSWR("ordersIron", fetcher);

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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSelectMachine = (machine) => {
    setSelectedMachine(machine);
  };

  const handleStartProcess = async (pedido) => {
    try {
      setLoading(true);

      // Obtener datos de las máquinas y estaciones de planchado
      const [machinesResponse, ironsResponse] = await Promise.all([
        api.get("/machines"),
        api.get("/ironStations"),
      ]);

      const allMachines = [...machinesResponse.data, ...ironsResponse.data];

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

  const handleFinishProcess = async () => {
    try {
      setLoading(true);

      if (!selectedPedido) {
        console.error("El pedido seleccionado es indefinido.");
        return;
      }

      const updatedPedidos = pedidos.map((p) =>
        p.id_order === selectedPedido.id_order
          ? { ...p, orderStatus: "finished" }
          : p
      );

      setPedidos(updatedPedidos);

      await api.patch(`/orders/${selectedPedido.id_order}`, {
        orderStatus: "finished",
      });
      setShowMachineName(false);
      showNotification(`Pedido finalizado`);
      // Actualizar datos
    } catch (error) {
      console.error("Error al finalizar el pedido:", error);
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

      const updatedPedidos = pedidos.map((p) =>
        p.id_order === selectedPedido.id_order
          ? { ...p, orderStatus: "inProgress" }
          : p
      );

      setPedidos(updatedPedidos);

      await api.patch(`/orders/${selectedPedido.id_order}`, {
        orderStatus: "inProgress",
        assignedMachine: selectedMachine.id,
      });
      setShowMachineName(false);
      showNotification(`Pedido iniciado en ${selectedMachine.model}`);
      // Actualizar datos
    } catch (error) {
      console.error("Error al actualizar el pedido:", error);
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
              <th>Empleado que Recibió</th>
              <th>Empleado que Entregó</th>
              <th>Nombre del Cliente</th>
              <th>Detalle del pedido</th>
              <th>Fecha de Entrega</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos.slice(startIndex, endIndex).map((pedido) => (
              <tr key={pedido.id_order}>
                <td className="py-3 px-1 text-center">{pedido.id_order}</td>
                <td className="py-3 px-6 font-medium text-gray-900">
                  {pedido.user.name}
                </td>
                <td className="py-3 px-6 font-medium text-gray-900">
                  {pedido.user.name}
                </td>
                <td className="py-3 px-6 font-medium text-gray-900">
                  {pedido.client.name}
                </td>
                <td className="py-3 px-6">
                  {pedido.ServiceOrderDetail.find(
                    (service) => service.id_serviceOrderDetail
                  ) != undefined
                    ? pedido.ServiceOrderDetail.length
                    : 0}
                </td>
                <td className="py-3 px-6">
                  {formatDate(pedido.scheduledDeliveryDate)}
                </td>
                <td className="py-3 px-6 font-bold ">
                  {pedido.orderStatus === "pending" ? (
                    <span className="text-gray-600 pl-1">
                      <MinusCircleOutlined /> Pendiente
                      <button
                        onClick={() => handleStartProcess(pedido)}
                        className="btn-primary ml-2 mt-1"
                      >
                        Iniciar
                      </button>
                    </span>
                  ) : pedido.orderStatus === "stored" ? (
                    <span className="text-fuchsia-600 pl-1">
                      <DropboxOutlined /> Almacenado
                    </span>
                  ) : pedido.orderStatus === "inProgress" ? (
                    <span className="text-yellow-600 pl-1">
                      <ClockCircleOutlined /> En Proceso
                      <button
                        onClick={() => handleFinishProcess()}
                        className="btn-primary ml-2 mt-1"
                      >
                        Finalizar
                      </button>
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
          pageCount={Math.ceil(filteredPedidos.length / itemsPerPage)}
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
        title="Seleccionar Máquina"
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
                <th>Modelo</th>
                <th>Tiempo de Ciclo</th>
                <th>Peso</th>
                <th>Estado de la Máquina</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {availableMachines.map((machine) => (
                <tr key={machine.id_machine}>
                  <td>{machine.machineType}</td>
                  <td>{machine.model}</td>
                  <td>{machine.cicleTime}</td>
                  <td>{machine.weight}</td>
                  <td
                    className={`${
                      machine.status === "available"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {machine.status === "available"
                      ? "Disponible"
                      : "No Disponible"}
                  </td>
                  <td>
                    <div className="flex flex-col items-center">
                      <Checkbox
                        key={`checkbox_${machine.id_machine}`}
                        checked={selectedMachine === machine}
                        onChange={() => handleSelectMachine(machine)}
                        className="mb-2"
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
