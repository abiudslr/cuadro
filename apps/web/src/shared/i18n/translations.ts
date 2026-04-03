export const translations = {
  en: {
    app: {
      name: 'Cuadro',
    },
    common: {
      configure: 'Configure',
      close: 'Close',
      save: 'Save',
      language: 'Language',
      english: 'English',
      spanish: 'Spanish',
      openSettings: 'Open settings',
      closeSettings: 'Close settings',
    },
    editor: {
      header: {
        title: 'Cuadro',
      },
      canvas: {
        title: 'Preview',
      },
      mobileDock: {
        orientation: 'Orientation',
        aspectRatio: 'Ratio',
        cells: 'Cells',
      },
      config: {
        title: 'Grid settings',
        sections: {
          layout: 'Layout',
          structure: 'Structure',
          appearance: 'Appearance',
        },
        fields: {
          orientation: 'Orientation',
          aspectRatio: 'Aspect ratio',
          rows: 'Rows',
          columns: 'Columns',
          marginWidth: 'Margin width',
          marginColor: 'Margin color',
          emptyCellColor: 'Empty cell color',
        },
        orientation: {
          vertical: 'Vertical',
          horizontal: 'Horizontal',
        },
        aspectRatio: {
          square: '1:1',
          ratio3x4: '3:4',
          ratio4x5: '4:5',
          ratio9x16: '9:16',
          ratio16x9: '16:9',
        },
        stepper: {
          decreaseRows: 'Decrease rows',
          increaseRows: 'Increase rows',
          decreaseColumns: 'Decrease columns',
          increaseColumns: 'Increase columns',
          decreaseMargin: 'Decrease margin width',
          increaseMargin: 'Increase margin width',
        },
      },
    },
  },
  es: {
    app: {
      name: 'Cuadro',
    },
    common: {
      configure: 'Configurar',
      close: 'Cerrar',
      save: 'Guardar',
      language: 'Idioma',
      english: 'English',
      spanish: 'Español',
      openSettings: 'Abrir configuración',
      closeSettings: 'Cerrar configuración',
    },
    editor: {
      header: {
        title: 'Cuadro',
      },
      canvas: {
        title: 'Vista previa',
      },
      mobileDock: {
        orientation: 'Orientación',
        aspectRatio: 'Ratio',
        cells: 'Celdas',
      },
      config: {
        title: 'Configuración de cuadrícula',
        sections: {
          layout: 'Layout',
          structure: 'Estructura',
          appearance: 'Apariencia',
        },
        fields: {
          orientation: 'Orientación',
          aspectRatio: 'Relación de aspecto',
          rows: 'Filas',
          columns: 'Columnas',
          marginWidth: 'Ancho de margen',
          marginColor: 'Color del margen',
          emptyCellColor: 'Color del cuadro vacío',
        },
        orientation: {
          vertical: 'Vertical',
          horizontal: 'Horizontal',
        },
        aspectRatio: {
          square: '1:1',
          ratio3x4: '3:4',
          ratio4x5: '4:5',
          ratio9x16: '9:16',
          ratio16x9: '16:9',
        },
        stepper: {
          decreaseRows: 'Disminuir filas',
          increaseRows: 'Aumentar filas',
          decreaseColumns: 'Disminuir columnas',
          increaseColumns: 'Aumentar columnas',
          decreaseMargin: 'Disminuir ancho de margen',
          increaseMargin: 'Aumentar ancho de margen',
        },
      },
    },
  },
} as const

export type Language = keyof typeof translations
