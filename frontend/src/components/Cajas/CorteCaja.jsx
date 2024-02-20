import React, { useState, useEffect } from "react";
import { Modal, Button, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import jsPDF from "jspdf";
import { useAuth } from "../../hooks/auth/auth";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { formatDate } from "../../utils/format";
import Swal from "sweetalert2";
import api from "../../api/api";

function CorteCaja() {
  const [Cortes, setCortes] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [fechaHora, setFechaHora] = useState("");
  const [workShift, setWorkShift] = useState(
    moment().hours() < 12 ? "morning" : "evening"
  );
  const [partialCorteDialogVisible, setPartialCorteDialogVisible] =
    useState(false);
  const [mostrarTabla, setMostrarTabla] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCorte, setSelectedCorte] = useState(null);
  const [corteActivo, setCorteActivo] = useState(false);
  const navigate = useNavigate();

  const { cookies } = useAuth();

  const [initialCash, setInitialCash] = useState(
    localStorage.getItem("initialCash")
  );
  const [cashCutId, setCashCutId] = useState(0);
  const [lastCashCut, setLastCashCut] = useState(
    JSON.parse(localStorage.getItem("lastCashCut"))
  );

  useEffect(() => {
    setCashCutId(localStorage.getItem("cashCutId"));
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    setFechaHora(formattedDate);
  }, []);

  useEffect(() => {
    if (lastCashCut) {
      setCorteActivo(true);
      // const currentCorte = Cortes.find((corte) =>
      //   moment(corte.cashCutD).isSame(now, "day")
      // );

      // if (currentCorte) {
      //   setCortes([currentCorte]);
      //   setMostrarTabla(true);
      // }
      setCortes([lastCashCut]);
      setMostrarTabla(true);
    }
  }, [lastCashCut]);

  const handleCorteCaja = () => {
    if (corteActivo) {
      message.info("Ya hay un corte de caja activo.");
    } else {
      setDialogVisible(true);
    }
  };

  /* ------------------------------ FULL CASHCUT ------------------------------------*/

  const handleConfirmCorteCaja = async () => {
    if (localStorage.getItem("lastCashCut")) {
      Swal.fire({
        icon: "error",
        title: "Ya has Cerrado Caja",
        text: "Intenta ir a Historial de Cortes para volver a imprimir el corte del dia que estabas buscando.",
        confirmButtonColor: "#034078",
      });
      setPartialCorteDialogVisible(false);
      return;
    } else if (!localStorage.getItem("cashCutId")) {
      Swal.fire({
        icon: "warning",
        title: "No se ha Inicializado Caja",
        text: "Da click en Iniciar Caja.",
        confirmButtonColor: "#034078",
      });
      setPartialCorteDialogVisible(false);
      navigate("/inicioCaja");
      return;
    }

    try {
      setWorkShift(moment().hours() < 12 ? "morning" : "evening");

      const response = await api.get(`/closeCashCut/${cashCutId}`);
      const supplyResponse = await api.patch(
        `/closeSupplyCashCut/${localStorage.getItem("id_supplyCashCut")}`
      );

      const corte = response.data;
      const corteSupply = supplyResponse.data;
      const nuevoCorte = {
        ...corte,
        id_cashCut: parseInt(localStorage.getItem("cashCutId")),
        id_supplyCashCut: parseInt(localStorage.getItem("id_supplyCashCut")),
        ...corteSupply,
      };

      const pdf = new jsPDF();

      pdf.text(`CORTE DE CAJA TURNO`, 10, 10);
      pdf.text(`ID: ${nuevoCorte.id_cashCut}`, 10, 20);
      pdf.text(`Usuario: ${cookies.username}`, 10, 30);
      pdf.text(
        `Turno: ${
          nuevoCorte.workShift === "morning"
            ? "Matutino"
            : nuevoCorte.workShift === "evening"
            ? "Vespertino"
            : "Nocturno"
        }`,
        10,
        40
      );

      initialCash
        ? pdf.text(`Dinero en Fondo: $${initialCash}`, 10, 60)
        : pdf.text("Dinero en Fondo: $0", 10, 60);

      // Separación
      pdf.text(`Detalles de Ingresos por Servicio:`, 10, 80);
      nuevoCorte.totalAutoservicio
        ? pdf.text(`Autoservicio: $${nuevoCorte.totalAutoservicio}`, 10, 90)
        : pdf.text("Autoservicio: $0", 10, 90);
      nuevoCorte.totalEncargo
        ? pdf.text(`Lavado por Encargo: $${nuevoCorte.totalEncargo}`, 10, 100)
        : pdf.text("Lavado por Encargo: $0", 10, 100);
      nuevoCorte.totalPlanchado
        ? pdf.text(`Planchado: $${nuevoCorte.totalPlanchado}`, 10, 110)
        : pdf.text("Planchado: $0", 10, 110);

      nuevoCorte.totalTintoreria
        ? pdf.text(`Tintorería: $${nuevoCorte.totalTintoreria}`, 10, 120)
        : pdf.text("Tintorería: $0", 10, 120);

      nuevoCorte.totalOtrosEncargo
        ? pdf.text(`Encargo Varios: $${nuevoCorte.totalOtrosEncargo}`, 10, 130)
        : pdf.text("Encargo Varios: $0", 10, 130);

      nuevoCorte.totalIncome
        ? pdf.text(
            `Total (Suma de los Servicios): $${nuevoCorte.totalIncome}`,
            10,
            140
          )
        : pdf.text("Total (Suma de los Servicios): $0", 10, 140);
      // Separación
      nuevoCorte.totalCash
        ? pdf.text(`Ingreso en Efectivo: $${nuevoCorte.totalCash}`, 10, 160)
        : pdf.text("Ingreso en Efectivo: $0", 10, 160);
      nuevoCorte.totalCredit
        ? pdf.text(`Ingreso en Tarjeta: $${nuevoCorte.totalCredit}`, 10, 170)
        : pdf.text("Ingreso en Tarjeta: $0", 10, 170);
      nuevoCorte.totalCashWithdrawal
        ? pdf.text(
            `Retiros Totales: $${nuevoCorte.totalCashWithdrawal}`,
            10,
            180
          )
        : pdf.text("Retiros Totales: $0", 10, 180);
      nuevoCorte.total
        ? pdf.text(`Final Total en Caja: $${nuevoCorte.total}`, 10, 190)
        : pdf.text("Final Total en Caja: $0", 10, 190);

      pdf.text(`Detalles de Suministros:`, 10, 210);
      // pdf.text(`Dinero Inicial: $${corteSupply.initialCash}`, 10, 220);
      pdf.text(`Total Pedidos Pagados: ${corteSupply.ordersPayed}`, 10, 230);
      pdf.text(`Total Jabon $${corteSupply.totalJabon}`, 10, 240);
      pdf.text(`Total Suavitel $${corteSupply.totalSuavitel}`, 10, 250);
      pdf.text(`Total Pinol $${corteSupply.totalPinol}`, 10, 260);
      pdf.text(
        `Total Desengrasante $${corteSupply.totalDesengrasante}`,
        10,
        270
      );
      pdf.text(`Total Cloro $${corteSupply.totalCloro}`, 10, 280);
      if (
        pdf.internal.getNumberOfPages() > 0 &&
        pdf.internal.getCurrentPageInfo().pageNumber === 1
      ) {
        // Si estamos en la página 1 y cerca del final, agregamos una nueva página
        pdf.addPage();
        pdf.text(`Total Sanitizante $${corteSupply.totalSanitizante}`, 10, 10);
        pdf.text(`Total Bolsa $${corteSupply.totalBolsa}`, 10, 20);
        pdf.text(`Total Reforzado $${corteSupply.totalReforzado}`, 10, 30);
        pdf.text(`Total Ganchos $${corteSupply.totalGanchos}`, 10, 40);
        pdf.text(`Total WC $${corteSupply.totalWC}`, 10, 50);
        pdf.text(`Total Otros $${corteSupply.totalOtros}`, 10, 60);
        pdf.text(`Total Tarjeta $${corteSupply.totalCredit}`, 10, 70);
        pdf.text(`Total Efectivo $${corteSupply.totalCash}`, 10, 80);
        pdf.text(`Total Ingresos $${corteSupply.totalIncome}`, 10, 90);
        pdf.text(
          `Turno: ${
            corteSupply.workShift === "morning"
              ? "Matutino"
              : corteSupply.workShift === "evening"
              ? "Vespertino"
              : "Nocturno"
          }`,
          10,
          100
        );
      }

      pdf.save(`corte_de_caja_Turno_${cookies.username}.pdf`);

      setLastCashCut(nuevoCorte);
      setCortes([nuevoCorte]);

      localStorage.setItem("lastCashCut", JSON.stringify(nuevoCorte));
      localStorage.removeItem("initialCash");
      localStorage.removeItem("cashCutId");
      localStorage.removeItem("id_supplyCashCut");
      setMostrarTabla(true); // Muestra la tabla después de hacer el corte

      setDialogVisible(false);

      const out = pdf.output("datauristring");
      await api.post("/sendCashCut", {
        date: moment().format("DD-MM-YYYY"),
        hour: moment().format("LT"),
        pdf: out.split("base64,")[1],
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDetallesClick = (corte) => {
    setSelectedCorte(corte);
    setModalVisible(true);
    console.log(corte);
  };

  const handlePartialCorteCaja = () => {
    setPartialCorteDialogVisible(true);
  };

  /* ------------------------------ PARTIAL CASHCUT ------------------------------------*/

  const handlePartialCorteConfirm = async () => {
    if (localStorage.getItem("lastCashCut")) {
      Swal.fire({
        icon: "error",
        title: "Ya has Cerrado Caja",
        text: "Intenta ir a Historial de Cortes para volver a imprimir el corte del dia que estabas buscando.",
        confirmButtonColor: "#034078",
      });
      setPartialCorteDialogVisible(false);
      return;
    } else if (!localStorage.getItem("cashCutId")) {
      Swal.fire({
        icon: "warning",
        title: "No se ha Inicializado Caja",
        text: "Da click en Iniciar Caja.",
        confirmButtonColor: "#034078",
      });
      setPartialCorteDialogVisible(false);
      navigate("/inicioCaja");
      return;
    }

    try {
      const now = new Date();
      const horaActual = now.getHours();

      setWorkShift(moment().hours() < 12 ? "morning" : "evening");

      const response = await api.get(`/calculateCashCut/${cashCutId}`);
      const supplyResponse = await api.get(
        `/calculateSupplyCashCut/${localStorage.getItem("id_supplyCashCut")}`
      );

      const corteSupply = supplyResponse.data;
      const corte = response.data;

      const nuevoCorte = {
        ...corte,
        id_supplyCashCut: parseInt(localStorage.getItem("id_supplyCashCut")),
        id_cashCut: parseInt(localStorage.getItem("cashCutId")),
        ...corteSupply,
      };

      const pdf = new jsPDF();
      pdf.text(`CORTE DE CAJA PARCIAL  `, 10, 10);
      pdf.text(`ID: ${nuevoCorte.id_cashCut}`, 10, 20);
      pdf.text(`Usuario: ${cookies.username}`, 10, 30);
      pdf.text(
        `Turno: ${
          nuevoCorte.workShift === "morning"
            ? "Matutino"
            : nuevoCorte.workShift === "evening"
            ? "Vespertino"
            : "Nocturno"
        }`,
        10,
        40
      );
      pdf.text(`Fecha: ${formatDate(nuevoCorte.cashCutD)}`, 10, 50);
      initialCash
        ? pdf.text(`Dinero en Fondo: $${initialCash}`, 10, 60)
        : pdf.text("Dinero en Fondo: $0", 10, 60);

      // Separación
      pdf.text(`Detalles de Ingresos por Servicio:`, 10, 80);
      nuevoCorte.totalAutoservicio
        ? pdf.text(`Autoservicio: $${nuevoCorte.totalAutoservicio}`, 10, 90)
        : pdf.text("Autoservicio: $0", 10, 90);
      nuevoCorte.totalEncargo
        ? pdf.text(`Lavado por Encargo: $${nuevoCorte.totalEncargo}`, 10, 100)
        : pdf.text("Lavado por Encargo: $0", 10, 100);
      nuevoCorte.totalPlanchado
        ? pdf.text(`Planchado: $${nuevoCorte.totalPlanchado}`, 10, 110)
        : pdf.text("Planchado: $0", 10, 110);

      nuevoCorte.totalTintoreria
        ? pdf.text(`Tintorería: $${nuevoCorte.totalTintoreria}`, 10, 120)
        : pdf.text("Tintorería: $0", 10, 120);

      nuevoCorte.totalOtrosEncargo
        ? pdf.text(`Encargo Varios: $${nuevoCorte.totalOtrosEncargo}`, 10, 130)
        : pdf.text("Encargo Varios: $0", 10, 130);

      nuevoCorte.totalIncome
        ? pdf.text(
            `Total (Suma de los Servicios): $${nuevoCorte.totalIncome}`,
            10,
            140
          )
        : pdf.text("Total (Suma de los Servicios): $0", 10, 140);
      // Separación
      nuevoCorte.totalCash
        ? pdf.text(`Ingreso en Efectivo: $${nuevoCorte.totalCash}`, 10, 160)
        : pdf.text("Ingreso en Efectivo: $0", 10, 160);
      nuevoCorte.totalCredit
        ? pdf.text(`Ingreso en Tarjeta: $${nuevoCorte.totalCredit}`, 10, 170)
        : pdf.text("Ingreso en Tarjeta: $0", 10, 170);
      nuevoCorte.totalCashWithdrawal
        ? pdf.text(
            `Retiros Totales: $${nuevoCorte.totalCashWithdrawal}`,
            10,
            180
          )
        : pdf.text("Retiros Totales: $0", 10, 180);
      nuevoCorte.total
        ? pdf.text(`Final Total en Caja: $${nuevoCorte.total}`, 10, 190)
        : pdf.text("Final Total en Caja: $0", 10, 190);

      pdf.text(`Detalles de Suministros:`, 10, 210);
      // pdf.text(`Dinero Inicial: $${corteSupply.initialCash}`, 10, 220);
      pdf.text(`Total Pedidos Pagados: ${nuevoCorte.ordersPayed}`, 10, 230);
      pdf.text(`Total Jabon $${nuevoCorte.totalJabon}`, 10, 240);
      pdf.text(`Total Suavitel $${nuevoCorte.totalSuavitel}`, 10, 250);
      pdf.text(`Total Pinol $${nuevoCorte.totalPinol}`, 10, 260);
      pdf.text(
        `Total Desengrasante $${nuevoCorte.totalDesengrasante}`,
        10,
        270
      );
      pdf.text(`Total Cloro $${nuevoCorte.totalCloro}`, 10, 280);
      if (
        pdf.internal.getNumberOfPages() > 0 &&
        pdf.internal.getCurrentPageInfo().pageNumber === 1
      ) {
        // Si estamos en la página 1 y cerca del final, agregamos una nueva página
        pdf.addPage();
        pdf.text(`Total Sanitizante $${nuevoCorte.totalSanitizante}`, 10, 10);
        pdf.text(`Total Bolsa $${nuevoCorte.totalBolsa}`, 10, 20);
        pdf.text(`Total Reforzado $${nuevoCorte.totalReforzado}`, 10, 30);
        pdf.text(`Total Ganchos $${nuevoCorte.totalGanchos}`, 10, 40);
        pdf.text(`Total WC $${nuevoCorte.totalWC}`, 10, 50);
        pdf.text(`Total Otros $${nuevoCorte.totalOtros}`, 10, 60);
        pdf.text(`Total Tarjeta $${nuevoCorte.totalCredit}`, 10, 70);
        pdf.text(`Total Efectivo $${nuevoCorte.totalCash}`, 10, 80);
        pdf.text(`Total Ingresos $${nuevoCorte.totalIncome}`, 10, 90);
        pdf.text(
          `Turno: ${
            nuevoCorte.workShift === "morning"
              ? "Matutino"
              : nuevoCorte.workShift === "evening"
              ? "Vespertino"
              : "Nocturno"
          }`,
          10,
          100
        );
      }

      pdf.save(`corte_de_caja_Parcial_${cookies.username}.pdf`);

      setCortes([nuevoCorte]);
      setPartialCorteDialogVisible(false);

      const partialCashCut = {
        cashCutId: nuevoCorte.id_cashCut,
        casher: cookies.username,
        workShift: nuevoCorte.workShift,
        date: moment().format("DD/MM/YYYY"),
        initialCash: initialCash ? initialCash : 0,
        selfService: nuevoCorte.totalAutoservicio,
        laundry: nuevoCorte.totalEncargo,
        iron: nuevoCorte.totalPlanchado,
        dryCleaning: nuevoCorte.totalTintoreria,
        others: nuevoCorte.totalOtrosEncargo,
        totalIncome: nuevoCorte.totalIncome,
        totalCash: nuevoCorte.totalCash,
        totalCredit: nuevoCorte.totalCredit,
        totalCashWithdrawal: nuevoCorte.totalCashWithdrawal,
        total: nuevoCorte.total,
      };

      await api.post("/generatePartialCashCutTicket", {
        cashCut: partialCashCut,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalPrint = () => {
    const pdf = new jsPDF();

    if (selectedCorte) {
      pdf.text(`Detalles del Corte`, 10, 10);
      pdf.text(`ID: ${selectedCorte.id_cashCut}`, 10, 20);
      pdf.text(`Usuario: ${cookies.username}`, 10, 30);
      pdf.text(
        `Turno: ${
          selectedCorte.workShift === "morning"
            ? "Matutino"
            : selectedCorte.workShift === "evening"
            ? "Vespertino"
            : "Nocturno"
        }`,
        10,
        40
      );
      pdf.text(`Fecha: ${formatDate(selectedCorte.cashCutD)}`, 10, 50);
      selectedCorte.initialCash
        ? pdf.text(`Dinero en Fondo: $${initialCash}`, 10, 60)
        : pdf.text("Dinero en Fondo: $0", 10, 60);

      // Separación
      pdf.text(`Detalles de Ingresos por Servicio:`, 10, 80);
      selectedCorte.totalAutoservicio
        ? pdf.text(`Autoservicio: $${selectedCorte.totalAutoservicio}`, 10, 90)
        : pdf.text("Autoservicio: $0", 10, 90);
      selectedCorte.totalEncargo
        ? pdf.text(
            `Lavado por Encargo: $${selectedCorte.totalEncargo}`,
            10,
            100
          )
        : pdf.text("Lavado por Encargo: $0", 10, 100);
      selectedCorte.totalPlanchado
        ? pdf.text(`Planchado: $${selectedCorte.totalPlanchado}`, 10, 110)
        : pdf.text("Planchado: $0", 10, 110);

      selectedCorte.totalTintoreria
        ? pdf.text(`Tintorería: $${selectedCorte.totalTintoreria}`, 10, 120)
        : pdf.text("Tintorería: $0", 10, 120);

      selectedCorte.totalOtrosEncargo
        ? pdf.text(
            `Encargo Varios: $${selectedCorte.totalOtrosEncargo}`,
            10,
            130
          )
        : pdf.text("Encargo Varios: $0", 10, 130);

      selectedCorte.totalIncome
        ? pdf.text(
            `Total (Suma de los Servicios): $${selectedCorte.totalIncome}`,
            10,
            140
          )
        : pdf.text("Total (Suma de los Servicios): $0", 10, 140);
      // Separación
      selectedCorte.totalCash
        ? pdf.text(`Ingreso en Efectivo: $${selectedCorte.totalCash}`, 10, 160)
        : pdf.text("Ingreso en Efectivo: $0", 10, 160);
      selectedCorte.totalCredit
        ? pdf.text(`Ingreso en Tarjeta: $${selectedCorte.totalCredit}`, 10, 170)
        : pdf.text("Ingreso en Tarjeta: $0", 10, 170);
      selectedCorte.totalCashWithdrawal
        ? pdf.text(
            `Retiros Totales: $${selectedCorte.totalCashWithdrawal}`,
            10,
            180
          )
        : pdf.text("Retiros Totales: $0", 10, 180);
      selectedCorte.total
        ? pdf.text(`Final Total en Caja: $${selectedCorte.total}`, 10, 190)
        : pdf.text("Final Total en Caja: $0", 10, 190);
      pdf.text(`Detalles de Suministros:`, 10, 210);
      // pdf.text(`Dinero Inicial: $${corteSupply.initialCash}`, 10, 220);
      pdf.text(`Total Pedidos Pagados: ${selectedCorte.ordersPayed}`, 10, 230);
      pdf.text(`Total Jabon $${selectedCorte.totalJabon}`, 10, 240);
      pdf.text(`Total Suavitel $${selectedCorte.totalSuavitel}`, 10, 250);
      pdf.text(`Total Pinol $${selectedCorte.totalPinol}`, 10, 260);
      pdf.text(
        `Total Desengrasante $${selectedCorte.totalDesengrasante}`,
        10,
        270
      );
      pdf.text(`Total Cloro $${selectedCorte.totalCloro}`, 10, 280);
      if (
        pdf.internal.getNumberOfPages() > 0 &&
        pdf.internal.getCurrentPageInfo().pageNumber === 1
      ) {
        // Si estamos en la página 1 y cerca del final, agregamos una nueva página
        pdf.addPage();
        pdf.text(
          `Total Sanitizante $${selectedCorte.totalSanitizante}`,
          10,
          10
        );
        pdf.text(`Total Bolsa $${selectedCorte.totalBolsa}`, 10, 20);
        pdf.text(`Total Reforzado $${selectedCorte.totalReforzado}`, 10, 30);
        pdf.text(`Total Ganchos $${selectedCorte.totalGanchos}`, 10, 40);
        pdf.text(`Total WC $${selectedCorte.totalWC}`, 10, 50);
        pdf.text(`Total Otros $${selectedCorte.totalOtros}`, 10, 60);
        pdf.text(`Total Tarjeta $${selectedCorte.totalCredit}`, 10, 70);
        pdf.text(`Total Efectivo $${selectedCorte.totalCash}`, 10, 80);
        pdf.text(`Total Ingresos $${selectedCorte.totalIncome}`, 10, 90);
        pdf.text(
          `Turno: ${
            selectedCorte.workShift === "morning"
              ? "Matutino"
              : selectedCorte.workShift === "evening"
              ? "Vespertino"
              : "Nocturno"
          }`,
          10,
          100
        );
      }

      pdf.save("detalle_corte.pdf");
    }
  };

  return (
    <div className="text-center mt-4">
      <h1 className="text-4xl">
        Bienvenido a corte de caja{" "}
        {cookies.role === "admin" ? "Administrador:" : "Empleado:"}{" "}
        <span className="title-strong text-4xl">{cookies.username}</span>
      </h1>
      <p className="text-2xl">{fechaHora}</p>
      <p className="text-xl mt-4">¿Desea realizar un corte de caja?</p>
      <button
        onClick={handleCorteCaja}
        className="mt-4 mr-2 bg-IndigoDye font-bold text-white p-3 rounded-md shadow-lg hover:bg-PennBlue hover:scale-105 transition-transform transform active:scale-95 focus:outline-none text-base"
      >
        Corte de Caja Turno
      </button>
      <button
        onClick={handlePartialCorteCaja}
        className="mt-4 bg-NonPhotoblue font-bold hover:text-white p-3 rounded-md shadow-lg hover:bg-Cerulean hover:scale-105 transition-transform transform active:scale-95 focus:outline-none text-base"
      >
        Corte de Caja Parcial
      </button>
      {mostrarTabla && (
        <div className="mt-4" style={{ overflowX: "auto" }}>
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-200">
              <tr>
                <th>No. Corte</th>
                <th>FECHA</th>
                <th>
                  DINERO <br />
                  EN FONDO
                </th>
                <th>
                  INGRESO <br />
                  EN EFECTIVO
                </th>
                <th>
                  INGRESO <br />
                  EN TARJETA
                </th>
                <th>
                  INGRESOS <br />
                  TOTALES
                </th>
                <th>
                  RETIROS <br />
                  TOTALES
                </th>
                <th>
                  FINAL <br />
                  TOTAL CAJA
                </th>
                <th></th>
              </tr>
            </thead>
            {/* TOTAL INCOME = (totalCash + totalCredit) - totalCashWithdrawal*/}
            <tbody>
              {Cortes.map((corte) => (
                <tr className="bg-white border-b" key={corte.id_cashCut}>
                  <td className="py-3 px-1 text-center">{corte.id_cashCut}</td>
                  <td className="py-3 px-6">{formatDate(corte.cashCutD)}</td>
                  <td className="py-3 px-6">
                    ${initialCash ? initialCash : 0}
                  </td>
                  <td className="py-3 px-6">
                    ${corte.totalCash ? corte.totalCash : 0}
                  </td>
                  <td className="py-3 px-6">
                    ${corte.totalCredit ? corte.totalCredit : 0}
                  </td>
                  <td className="py-3 px-6">
                    ${corte.totalIncome ? corte.totalIncome : 0}
                  </td>
                  <td className="py-3 px-6">
                    ${corte.totalCashWithdrawal ? corte.totalCashWithdrawal : 0}
                  </td>
                  <td className="py-3 px-6">
                    ${corte.total ? corte.total : 0}
                  </td>
                  <td className="py-3 px-6">
                    <button
                      className="btn-primary"
                      onClick={() => handleDetallesClick(corte)}
                    >
                      <AiOutlinePlusCircle size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        title="Confirmar Corte de Caja Turno"
        open={dialogVisible}
        onOk={handleConfirmCorteCaja}
        onCancel={() => setDialogVisible(false)}
        width={400}
        footer={[
          <Button
            key="confirmar"
            onClick={handleConfirmCorteCaja}
            className="btn-print text-white"
          >
            Confirmar
          </Button>,
          <Button
            key="cancelar"
            onClick={() => setDialogVisible(false)}
            className="btn-cancel-modal text-white"
          >
            Cancelar
          </Button>,
        ]}
      >
        <p>¿Estás seguro de realizar un corte de caja de turno?</p>
      </Modal>
      <Modal
        title="Confirmar Corte de Caja Parcial"
        open={partialCorteDialogVisible}
        onOk={handlePartialCorteConfirm}
        onCancel={() => setPartialCorteDialogVisible(false)}
        width={400}
        footer={[
          <Button
            key="confirmar"
            onClick={handlePartialCorteConfirm}
            className="btn-print text-white"
          >
            Confirmar
          </Button>,
          <Button
            key="cancelar"
            onClick={() => setPartialCorteDialogVisible(false)}
            className="btn-cancel-modal text-white"
          >
            Cancelar
          </Button>,
        ]}
      >
        <p>¿Estás seguro de realizar un corte de caja parcial?</p>
      </Modal>
      <Modal
        title="Detalles del Corte"
        open={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        width={900} // Ajusta el ancho según necesidades
        footer={[
          <Button
            key="print"
            onClick={handleModalPrint}
            className="btn-print text-white"
          >
            Imprimir
          </Button>,
          <Button
            key="close"
            onClick={() => setModalVisible(false)}
            className="btn-cancel-modal"
          >
            Cerrar
          </Button>,
        ]}
      >
        {selectedCorte && (
          <div className="flex">
            {/* Primera Columna */}
            <div className="w-1/2">
              <p className="text-lg">
                <span className="font-bold">ID:</span>{" "}
                {selectedCorte.id_cashCut}
              </p>
              <p className="text-lg text-white">
                <span className="font-bold">Usuario:</span> {cookies.username}
              </p>
              <p className="text-lg">
                <span className="font-bold">Turno:</span>{" "}
                {selectedCorte.workShift === "morning"
                  ? "Matutino"
                  : selectedCorte.workShift === "evening"
                  ? "Vespertino"
                  : ""}
              </p>
              <p className="text-lg">
                <span className="font-bold">Fecha:</span>{" "}
                {formatDate(selectedCorte.cashCutD)}
              </p>
              <p className="text-lg">
                <span className="font-bold">Dinero en Fondo:</span> $
                {initialCash}
              </p>
              <br />
              <p className="text-lg">
                <span className="font-bold">
                  Detalles de Ingresos por Servicio:
                </span>
              </p>
              <p className="text-lg">
                <span className="font-bold">Autoservicio:</span> $
                {selectedCorte.totalAutoservicio
                  ? selectedCorte.totalAutoservicio
                  : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Lavado por Encargo:</span> $
                {selectedCorte.totalEncargo ? selectedCorte.totalEncargo : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Planchado:</span> $
                {selectedCorte.totalPlanchado
                  ? selectedCorte.totalPlanchado
                  : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Tintorería:</span> $
                {selectedCorte.totalTintoreria
                  ? selectedCorte.totalTintoreria
                  : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Encargo Varios:</span> $
                {selectedCorte.totalOtrosEncargo
                  ? selectedCorte.totalOtrosEncargo
                  : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">
                  Total (Suma de los Servicios):
                </span>{" "}
                ${selectedCorte.totalIncome ? selectedCorte.totalIncome : 0}
              </p>
            </div>
            {/* Tercera Columna */}
            <div className="w-1/3">
              <p className="text-lg">
                <span className="font-bold">Ingreso de Productos:</span>
              </p>
              <p className="text-lg">
                <span className="font-bold">Jabón:</span> $
                {selectedCorte.totalJabon ? selectedCorte.totalJabon : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Suavitel:</span> $
                {selectedCorte.totalSuavitel ? selectedCorte.totalSuavitel : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Pinol:</span> $
                {selectedCorte.totalPinol ? selectedCorte.totalPinol : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Desengrasante:</span> $
                {selectedCorte.totalDesengrasante
                  ? selectedCorte.totalDesengrasante
                  : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Cloro:</span> $
                {selectedCorte.totalCloro ? selectedCorte.totalCloro : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Sanitizante:</span> $
                {selectedCorte.totalSanitizante
                  ? selectedCorte.totalSanitizante
                  : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Bolsa:</span> $
                {selectedCorte.totalBolsa ? selectedCorte.totalBolsa : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Reforzado:</span> $
                {selectedCorte.totalReforzado
                  ? selectedCorte.totalReforzado
                  : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Ganchos:</span> $
                {selectedCorte.totalGanchos ? selectedCorte.totalGanchos : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">WC:</span> $
                {selectedCorte.totalWC ? selectedCorte.totalWC : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Otros:</span> $
                {selectedCorte.totalOtros ? selectedCorte.totalOtros : 0}
              </p>
            </div>
            {/* Segunda Columna */}
            <div className="w-1/1">
              <p className="text-lg">
                <span className="font-bold">Ingreso en Efectivo:</span> $
                {selectedCorte.totalCash ? selectedCorte.totalCash : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Ingreso en Tarjeta:</span> $
                {selectedCorte.totalCredit ? selectedCorte.totalCredit : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Retiros Totales:</span> $
                {selectedCorte.totalCashWithdrawal
                  ? selectedCorte.totalCashWithdrawal
                  : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Final Total en Caja:</span> $
                {selectedCorte.total ? selectedCorte.total : 0}
              </p>
              <br />
              <br />
              <p className="text-lg">
                <span className="font-bold">
                  Ingresos totales de productos:
                </span>
              </p>
              <p className="text-lg">
                <span className="font-bold">Ordenes Pagadas: </span>
                {selectedCorte.ordersPayed}
              </p>
              <p className="text-lg">
                <span className="font-bold">
                  Ingreso de productos con Efectivo:
                </span>{" "}
                ${selectedCorte.totalCash ? selectedCorte.totalCash : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">
                  Ingreso de productos con Tarjeta:
                </span>{" "}
                ${selectedCorte.totalCredit ? selectedCorte.totalCredit : 0}
              </p>
              <p className="text-lg">
                <span className="font-bold">Ingreso total de productos:</span> $
                {selectedCorte.totalIncome ? selectedCorte.totalIncome : 0}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CorteCaja;
