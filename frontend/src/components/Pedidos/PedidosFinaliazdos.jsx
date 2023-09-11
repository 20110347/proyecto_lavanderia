import React, { useState, useEffect } from "react";
import Axios from "axios";
import { HiOutlineSearch } from "react-icons/hi";
import { Link } from "react-router-dom";

function PedidosFinalizados() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    // Simulación de datos (dummy)
    const dummyPedidos = [
      {
        id: 1,
        nombreCliente: "Saul",
        tipoPedido: "Lavado de patas",
        precio: 100,
        estado: "Finalizado",
      },
      {
        id: 2,
        nombreCliente: "Axel",
        tipoPedido: "Monas Chinas",
        precio: 150,
        estado: "Finalizado con adeudo",
        adeudo: 50,
      },
    ];

    setPedidos(dummyPedidos);
  }, []);

  const handleFiltroChange = (event) => {
    setFiltro(event.target.value);
  };

  const filteredPedidos = pedidos.filter((pedido) => {
    return (
      pedido.nombreCliente.toLowerCase().includes(filtro.toLowerCase()) ||
      pedido.id.toString().includes(filtro) ||
      pedido.tipoPedido.toLowerCase().includes(filtro.toLowerCase())
    );
  });

  return (
    <div>
      <div className="mb-3">
        <div className=" bg-white px-4 pt-3 pb-4 rounded-md border vorder-gray-200 flex-1">
          <strong>Pedidos Finalizados</strong>
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
              <HiOutlineSearch fontSize={20} className="text-gray-400 " />
            </div>
          </div>
        </div>
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200">
            <tr>
              <th className="py-3 px-1 text-center">ID</th>
              <th className="py-3 px-6">Nombre del Cliente</th>
              <th className="py-3 px-6">Tipo de Pedido</th>
              <th className="py-3 px-6">Precio</th>
              <th className="py-3 px-6">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos.map((pedido) => (
              <tr className="bg-white border-b" key={pedido.id}>
                <td className="py-3 px-1 text-center">{pedido.id}</td>
                <td className="py-3 px-6 font-medium text-gray-900">
                  {pedido.nombreCliente}
                </td>
                <td className="py-3 px-6 font-medium text-gray-900">
                  {pedido.tipoPedido}
                </td>
                <td className="py-3 px-6">${pedido.precio}</td>
                <td
                  className={`py-3 px-6 ${
                    pedido.estado === "Finalizado con adeudo"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {pedido.estado}
                  {pedido.adeudo && pedido.adeudo > 0 && (
                    <span className="text-red-600 pl-1">
                      (+${pedido.adeudo} Adeudo)
                    </span>
                  )}
                </td>
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

export default PedidosFinalizados;
