import React, { useState, useEffect } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { Link } from "react-router-dom";

import {
  IssuesCloseOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  ClockCircleOutlined,
  StopOutlined
} from "@ant-design/icons";

function PedidosPlanchado() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filteredPedidos, setFilteredPedidos] = useState([]);

  useEffect(() => {
    const dummyPedidos = [
      {
        id_pedido: 1,
        user: "Saul",
        cliente: "Juan",
        id_cobro: 1,
        pedidoDetalle: "Planchado de camisas",
        orderstatus: "Pendiente",
        totalPrice: 100,
        forma_pago: "Tarjeta",
        fentrega: "2023-09-15",
        f_recepcion: "2023-09-12",
        equipo: "Plancha 2",
      },
      {
        id_pedido: 2,
        user: "Maria",
        cliente: "Axel",
        id_cobro: 2,
        pedidoDetalle: "Planchado de pantalones",
        orderstatus: "En proceso",
        totalPrice: 150,
        forma_pago: "Efectivo",
        fentrega: "2023-09-16",
        f_recepcion: "2023-09-13",
        equipo: "Plancha 2",
      },
      {
        id_pedido: 3,
        user: "Luis",
        cliente: "Carlos",
        id_cobro: 3,
        pedidoDetalle: "Planchado de vestidos",
        orderstatus: "Finalizado",
        totalPrice: 80,
        forma_pago: "Efectivo",
        fentrega: "2023-09-17",
        f_recepcion: "2023-09-14",
        equipo: "Plancha 2",
      },
      {
        id_pedido: 4,
        user: "Ana",
        cliente: "Laura",
        id_cobro: 4,
        pedidoDetalle: "Planchado delicado",
        orderstatus: "Entregado",
        totalPrice: 120,
        forma_pago: "Tarjeta",
        fentrega: "2023-09-18",
        f_recepcion: "2023-09-15",
        equipo: "Plancha 2",
      },
      {
        id_pedido: 5,
        user: "Ximena",
        cliente: "Fernanda",
        id_cobro: 5,
        pedidoDetalle: "Planchado básico",
        orderstatus: "CANCELADO",
        totalPrice: 80,
        forma_pago: "Tarjeta",
        fentrega: "2023-09-18",
        f_recepcion: "2023-09-15",
        equipo: "Plancha 2",
      },
    ];

    setPedidos(dummyPedidos);
    setFilteredPedidos(dummyPedidos);
  }, []);

  const handleFiltroChange = (event) => {
    setFiltro(event.target.value);
    filterPedidos(event.target.value);
  };

  const filterPedidos = (filterText) => {
    const filtered = pedidos.filter((pedido) => {
      return (
        pedido.cliente.toLowerCase().includes(filterText.toLowerCase()) ||
        pedido.user.toLowerCase().includes(filterText.toLowerCase()) ||
        pedido.id_pedido.toString().includes(filterText)
      );
    });
    setFilteredPedidos(filtered);
  };


  return (
    <div>
      <div className="mb-3">
        <div className="bg-white px-4 pt-3 pb-4 rounded-md border border-gray-200 flex-1">
          <strong>Pedidos Lavandería</strong>
        </div>
      </div>
      <div className="bg-neutral-600 rounded-md min-h-screen p-4">
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
        </div>
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200">
            <tr>
              <th className="py-3 px-1 text-center">ID</th>
              <th className="py-3 px-6">Nombre del Cliente</th>
              <th className="py-3 px-6">Nombre del Empleado</th>
              <th className="py-3 px-6">Detalle del pedido</th>
              <th className="py-3 px-6">Fecha de Recepción</th>
              <th className="py-3 px-6">Estatus</th>
              <th className="py-3 px-6">Forma de Pago</th>
              <th className="py-3 px-6">Fecha de Entrega</th>
              <th className="py-3 px-6">Equipo</th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos
              .filter((pedido) => {
                return (
                  pedido.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
                  pedido.user.toLowerCase().includes(filtro.toLowerCase()) ||
                  pedido.id_pedido.toString().includes(filtro)
                );
              })
              .map((pedido) => (
                <tr className="bg-white border-b" key={pedido.id_pedido}>
                  <td className="py-3 px-1 text-center">{pedido.id_pedido}</td>
                  <td className="py-3 px-6 font-medium text-gray-900">
                    {pedido.cliente}
                  </td>
                  <td className="py-3 px-6 font-medium text-gray-900">
                    {pedido.user}
                  </td>
                  <td className="py-3 px-6">{pedido.pedidoDetalle}</td>
                  <td className="py-3 px-6">{pedido.f_recepcion}</td>
                  <td className="py-3 px-6">
                    {pedido.orderstatus === "Pendiente" ? (
                      <span className="text-gray-600 pl-1">
                        <MinusCircleOutlined /> Pendiente
                      </span>
                    ) : pedido.orderstatus === "En proceso" ? (
                      <span className="text-yellow-600 pl-1">
                        <ClockCircleOutlined /> En Proceso
                      </span>
                    ) : pedido.orderstatus === "Finalizado" ? (
                      <span className="text-blue-600 pl-1">
                        <IssuesCloseOutlined /> Finalizado no entregado
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
                  <td className="py-3 px-6">{pedido.fentrega}</td>
                  <td className="py-3 px-6">{pedido.equipo}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <Link
          to="/menuPuntoVenta"
          className="mt-4 flex text-center text-decoration-none"
        >
          <button className="bg-blue-500 text-white p-3 rounded-md shadow-lg hover:bg-blue-600 hover:scale-105 transition-transform transform active:scale-95 focus:outline-none text-sm">
            <div className="text-lg font-semibold">Volver</div>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default PedidosPlanchado;
