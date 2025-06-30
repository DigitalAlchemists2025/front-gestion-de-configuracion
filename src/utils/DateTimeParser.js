/* 
  Función para convertir fechas a formato chileno
*/

const DateTimeParser = (fechaISO) => {
    if (!fechaISO) return "N/A";
  
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Santiago',
      hour12: false,
    };
  
    const formatter = new Intl.DateTimeFormat('es-CL', options);
    const parts = formatter.formatToParts(new Date(fechaISO));
  
    const map = {};
    parts.forEach(p => map[p.type] = p.value);
  
    const { day, month, year, hour, minute } = map;
  
    return `${day}/${month}/${year}, ${hour}:${minute}`;
  };
  
  export default DateTimeParser;