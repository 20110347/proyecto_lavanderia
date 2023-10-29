import React, { useState, useEffect } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { Modal, Button } from "antd";
import { useLocation } from "react-router-dom";
import ReactPaginate from "react-paginate";

import {
  IssuesCloseOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  DropboxOutlined,
} from "@ant-design/icons";

function PedidosGeneral() {
  const [pedidos, setPedidos] = useState([]);
  const [selectedPedidos, setSelectedPedidos] = useState({});
  const [filtro, setFiltro] = useState("");
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const location = useLocation();
  const machineIdQueryParam = new URLSearchParams(location.search).get(
    "machineId"
  );
  const machineModelQueryParam = new URLSearchParams(location.search).get(
    "machineModel"
  );
  const showCheckbox = machineIdQueryParam !== null;
  const [showMachineName, setShowMachineName] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  useEffect(() => {
    const dummyPedidos = [
      {
        id_pedido: 1,
        empleado_recibio: "Juan",
        empleado_entrego: "María",
        cliente: "Saul Rodriguez",
        id_cobro: 1,
        pedidoDetalle: "Lavado de patas",
        orderstatus: "Pendiente",
        fecha_entrega_real: "15/09/2023",
        forma_pago: "A la entrega",
      },

      {
        id_pedido: 2,
        empleado_recibio: "Axel",
        empleado_entrego: "María",
        cliente: "Maria Fernandez",
        id_cobro: 2,
        pedidoDetalle: "Monas Chinas Planchadas",
        orderstatus: "En proceso",
        fecha_entrega_real: "16/09/2023",
        forma_pago: "Anticipado",
      },
      {
        id_pedido: 3,
        empleado_recibio: "Carlos",
        empleado_entrego: "Luis",
        cliente: "Luis Robledo",
        id_cobro: 3,
        pedidoDetalle: "Lavado",
        orderstatus: "Finalizado",
        fecha_entrega_real: "17/09/2023",
        forma_pago: "A la entrega",
      },
      {
        id_pedido: 4,
        empleado_recibio: "Laura",
        empleado_entrego: "Ana",
        cliente: "Axel Vergara",
        id_cobro: 4,
        pedidoDetalle: "Planchado Basico",
        orderstatus: "Entregado",
        fecha_entrega_real: "18/09/2023",
        forma_pago: "Anticipado",
      },
      {
        id_pedido: 6,
        empleado_recibio: "Fernanda",
        empleado_entrego: "Hector",
        cliente: "Kevin Miranda",
        id_cobro: 6,
        pedidoDetalle: "Planchado basico",
        orderstatus: "Almacenado",
        fecha_entrega_real: "15/09/2023",
        forma_pago: "A la entrega",
      },
      {
        id_pedido: 7,
        empleado_recibio: "El didacta",
        empleado_entrego: "El inquisidor",
        cliente: "El jefe maestro",
        id_cobro: 7,
        pedidoDetalle: "Lavado de patas",
        orderstatus: "Pendiente",
        fecha_entrega_real: "17/09/2023",
        forma_pago: "A la entrega",
      },
      {
        id_pedido: 8,
        empleado_recibio: "Fernanda",
        empleado_entrego: "Hector",
        cliente: "Kevin Miranda",
        id_cobro: 8,
        pedidoDetalle: "Planchado basico",
        orderstatus: "Almacenado",
        fecha_entrega_real: "17/09/2023",
        forma_pago: "A la entrega",
      },
    ];

    setPedidos(dummyPedidos);
    setFilteredPedidos(dummyPedidos);
  }, []);

  useEffect(() => {
    const filtered = pedidos.filter((pedido) => {
      if (filtroEstatus === "") {
        return true;
      } else {
        return pedido.orderstatus.toLowerCase() === filtroEstatus.toLowerCase();
      }
    });

    const textFiltered = filtered.filter((pedido) => {
      return (
        pedido.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
        pedido.empleado_recibio.toLowerCase().includes(filtro.toLowerCase()) ||
        pedido.empleado_entrego.toLowerCase().includes(filtro.toLowerCase()) ||
        pedido.id_pedido.toString().includes(filtro)
      );
    });

    setFilteredPedidos(textFiltered);
  }, [filtro, filtroEstatus, pedidos]);

  const handleFiltroChange = (event) => {
    setFiltro(event.target.value);
  };

  const handleFiltroEstatusChange = (event) => {
    setFiltroEstatus(event.target.value);
  };

  const handleNotificarCliente = (pedido) => {
    console.log(`Notifying the client for pedido ID: ${pedido.id_pedido}`);
    setShowMachineName(false);
    showNotification("NOTIFICACIÓN ENVIADA...");
  };

  const showNotification = (message) => {
    setNotificationMessage(message);
    setNotificationVisible(true);

    setTimeout(() => {
      setNotificationVisible(false);
    }, 2000);
  };

  const handleSeleccionarPedido = (pedidoId, cliente) => {
    const pedidoSeleccionado = pedidos.find(
      (pedido) => pedido.id_pedido === pedidoId
    );

    if (pedidoSeleccionado && pedidoSeleccionado.orderstatus === "Pendiente") {
      if (selectedPedidos[machineIdQueryParam]) {
        setSelectedPedidos((prevState) => ({
          ...prevState,
          [machineIdQueryParam]: null,
        }));
      }

      const pedidosActualizados = pedidos.map((pedido) => {
        if (pedido.id_pedido === pedidoId) {
          return { ...pedido, orderstatus: "En proceso" };
        }
        return pedido;
      });

      setSelectedPedidos((prevState) => ({
        ...prevState,
        [machineIdQueryParam]: pedidoId,
      }));

      setPedidos(pedidosActualizados);

      const modal = Modal.info({
        title: "Pedido en Proceso",
        content: (
          <div>
            <p>
              El pedido para el cliente: {cliente} ha sido cambiado a "En
              Proceso".
            </p>
            {machineModelQueryParam && <p>EQUIPO: {machineModelQueryParam}</p>}
          </div>
        ),
        onOk() {},
        footer: null,
      });

      setTimeout(() => {
        modal.destroy();
      }, 1500);
    } else {
      const modal = Modal.error({
        title: "Error",
        content: "No se puede cambiar el estado de este pedido.",
        onOk() {},
      });

      setTimeout(() => {
        modal.destroy();
      }, 1500);
    }
  };

  return (
    <div>
      <div className="mb-3">
        <div className="title-container">
          <strong className="title-strong">Pedidos Genaral</strong>
        </div>
      </div>
      <div className="flex items-center mb-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar..."
            className="border-2 rounded-md py-2 px-4 pl-10 text-gray-600 focus:outline-none focus:ring focus:border-blue-300 border-black"
            value={filtro}
            onChange={handleFiltroChange}
          />
          <div className="absolute top-2.5 left-1 text-gray-400">
            <HiOutlineSearch fontSize={20} className="text-gray-400" />
          </div>
        </div>
        <select
          className="ml-2 border-2 font-bold text-base rounded-md py-2 px-4 text-black focus:outline-none focus:ring focus:border-blue-300 border-black"
          value={filtroEstatus}
          onChange={handleFiltroEstatusChange}
        >
          <option className="text-base font-semibold" value="">
            Todos
          </option>
          <option
            value="Pendiente"
            className="text-gray-600 font-semibold text-base"
          >
            Pendientes
          </option>
          <option
            value="En proceso"
            className="text-yellow-600 font-semibold text-base"
          >
            En Proceso
          </option>
          <option
            value="Finalizado"
            className="text-blue-600 font-semibold text-base"
          >
            Finalizados
          </option>
          <option
            value="Entregado"
            className="text-green-600 font-semibold text-base"
          >
            Entregados
          </option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200">
            <tr>
              <th>ID</th>
              <th>Empleado que Recibió</th>
              <th>Empleado que Entregó</th>
              <th>Nombre del Cliente</th>
              <th>Detalle del pedido</th>
              <th>Fecha de Entrega</th>
              <th>Estatus</th>
              <th>Forma de Pago</th>
              {showCheckbox && <th className="py-3 px-6">Seleccionar</th>}
            </tr>
          </thead>
          <tbody>
            {filteredPedidos.slice(startIndex, endIndex).map((pedido) => (
              <tr className="bg-white border-b" key={pedido.id_pedido}>
                <td className="py-3 px-1 text-center">{pedido.id_pedido}</td>
                <td className="py-3 px-6 font-medium text-gray-900">
                  {pedido.empleado_recibio}
                </td>
                <td className="py-3 px-6 font-medium text-gray-900">
                  {pedido.empleado_entrego}
                </td>
                <td className="py-3 px-6 font-medium text-gray-900">
                  {pedido.cliente}
                </td>
                <td className="py-3 px-6">{pedido.pedidoDetalle}</td>
                <td className="py-3 px-6">{pedido.fecha_entrega_real}</td>
                <td className="py-3 px-6">
                  {pedido.orderstatus === "Pendiente" ? (
                    <span className="text-gray-600 pl-1">
                      <MinusCircleOutlined /> Pendiente
                    </span>
                  ) : pedido.orderstatus === "Almacenado" ? (
                    <span className="text-fuchsia-600 pl-1">
                      <DropboxOutlined /> Almacenado
                    </span>
                  ) : pedido.orderstatus === "En proceso" ? (
                    <span className="text-yellow-600 pl-1">
                      <ClockCircleOutlined /> En Proceso
                    </span>
                  ) : pedido.orderstatus === "Finalizado" ? (
                    <span className="text-blue-600 pl-1">
                      <IssuesCloseOutlined /> Finalizado no entregado
                      <button
                        onClick={() => handleNotificarCliente(pedido)}
                        className="ml-2 mt-2 bg-blue-600 text-white rounded-md px-2 py-1 cursor-pointer transform transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95"
                      >
                        Notificar al Cliente
                      </button>
                    </span>
                  ) : pedido.orderstatus === "Entregado" ? (
                    <span className="text-green-600 pl-1">
                      <CheckCircleOutlined /> Finalizado Entregado
                    </span>
                  ) : (
                    <span className="text-red-600 pl-1">
                      <StopOutlined /> Cancelado
                    </span>
                  )}
                </td>
                <td className="py-3 px-6">{pedido.forma_pago}</td>
                {showCheckbox && (
                  <td className="py-3 px-6">
                    {pedido.orderstatus === "Pendiente" ? (
                      selectedPedidos[machineIdQueryParam] ? (
                        <input type="checkbox" className="h-6 w-6" disabled />
                      ) : (
                        <input
                          type="checkbox"
                          className="h-6 w-6"
                          onChange={() =>
                            handleSeleccionarPedido(
                              pedido.id_pedido,
                              pedido.cliente
                            )
                          }
                        />
                      )
                    ) : null}
                  </td>
                )}
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
          pageLinkClassName="bg-blue-500 text-white py-2 px-4 rounded-full mx-1 hover:bg-blue-600 hover:no-underline"
          previousLinkClassName="bg-blue-500 text-white py-2 px-4 rounded-full mx-1 hover:bg-blue-600 hover:no-underline"
          nextLinkClassName="bg-blue-500 text-white py-2 px-4 rounded-full mx-1 hover:bg-blue-600 hover:no-underline"
          breakLinkClassName="text-gray-600 py-2 px-4 rounded-full mx-1"
          activeLinkClassName="bg-blue-700 text-white py-2 px-4 rounded-full mx-1"
        />
      </div>
      <Modal
        visible={notificationVisible}
        footer={null}
        onCancel={() => setNotificationVisible(false)}
        destroyOnClose
        afterClose={() => setNotificationVisible(false)}
      >
        <div className="text-center">
          <div style={{ fontSize: "36px", color: "#52c41a" }}>
            <CheckCircleOutlined />
          </div>
          <p>{notificationMessage}</p>
          {showMachineName && <p>EQUIPO: {machineModelQueryParam}</p>}
        </div>
      </Modal>
    </div>
  );
}

export default PedidosGeneral;
