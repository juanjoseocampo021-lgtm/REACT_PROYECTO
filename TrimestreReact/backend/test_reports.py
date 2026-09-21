import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.graphics.shapes import Drawing, Rect, String, Line
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

BRAND = '#1a5c59'
BRAND_LIGHT = '#e6f4f1'
GOLD = '#d4a853'

OUT = os.path.join(os.path.dirname(__file__), '..')

styles = getSampleStyleSheet()

def make_header(elements, titulo, subtitulo=None):
    d = Drawing(500, 70)
    d.add(Rect(0, 50, 500, 20, fillColor=colors.HexColor(BRAND), strokeColor=None))
    d.add(Rect(0, 47, 500, 3, fillColor=colors.HexColor(GOLD), strokeColor=None))
    d.add(String(20, 55, 'HORIZONTE VIAJES', fillColor=colors.white, fontSize=14, fontName='Helvetica-Bold'))
    d.add(String(350, 55, 'Documento oficial', fillColor=colors.white, fontSize=8, fontName='Helvetica'))
    d.add(Line(0, 44, 500, 44, strokeColor=colors.HexColor(BRAND), strokeWidth=0.5))
    elements.append(d)
    elements.append(Spacer(1, 8))
    ts = styles['Title'].clone('T')
    ts.textColor = colors.HexColor(BRAND)
    ts.fontSize = 16
    elements.append(Paragraph(titulo, ts))
    if subtitulo:
        ss = styles['Normal'].clone('S')
        ss.textColor = colors.HexColor('#4a5568')
        ss.fontSize = 10
        elements.append(Paragraph(subtitulo, ss))
    elements.append(Spacer(1, 6))

def make_footer(elements):
    elements.append(Spacer(1, 20))
    d = Drawing(500, 30)
    d.add(Line(0, 20, 500, 20, strokeColor=colors.HexColor('#e2e8f0'), strokeWidth=0.5))
    d.add(String(0, 5, 'Horizonte Viajes - Generado: ' + datetime.now().strftime('%d/%m/%Y %H:%M'),
                 fillColor=colors.HexColor('#718096'), fontSize=7, fontName='Helvetica'))
    d.add(String(350, 5, 'www.horizonteviajes.com',
                 fillColor=colors.HexColor(BRAND), fontSize=7, fontName='Helvetica-Bold'))
    elements.append(d)

def make_table_style():
    return TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(BRAND)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor(BRAND_LIGHT)]),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor(BRAND_LIGHT)),
        ('LINEABOVE', (0, -1), (-1, -1), 1.5, colors.HexColor(BRAND)),
    ])


# =========================================
# PDF REPORTE VENTAS
# =========================================
elements = []
make_header(elements, 'Reporte Diario de Ventas',
            '<b>Fecha:</b> 17/09/2026  |  <b>Generado:</b> ' + datetime.now().strftime('%d/%m/%Y %H:%M'))

ventas = [
    (1, 'Carlos Martinez', '1.023.456.789', 500000, 95000, 595000, 'Completada', '09:15'),
    (2, 'Laura Rodriguez', '1.098.765.432', 350000, 66500, 416500, 'Completada', '11:30'),
    (3, 'Andres Lopez', '1.056.789.012', 800000, 152000, 952000, 'Pendiente', '14:00'),
    (4, 'Maria Fernandez', '1.034.567.890', 250000, 47500, 297500, 'Completada', '16:45'),
    (5, 'Pedro Sanchez', '1.067.890.123', 1200000, 228000, 1428000, 'Pendiente', '18:20'),
]

data = [['#', 'Cliente', 'Documento', 'Subtotal', 'IVA', 'Total', 'Estado', 'Hora']]
for v in ventas:
    data.append([str(v[0]), v[1], v[2],
                 '${:,.0f}'.format(v[3]), '${:,.0f}'.format(v[4]), '${:,.0f}'.format(v[5]),
                 v[6], v[7]])

t_sub = sum(v[3] for v in ventas)
t_iva = sum(v[4] for v in ventas)
t_gen = sum(v[5] for v in ventas)
data.append(['', '', '', '', '', '', '', ''])
data.append(['', '', 'TOTAL', '${:,.0f}'.format(t_sub), '${:,.0f}'.format(t_iva), '${:,.0f}'.format(t_gen), '', ''])

table = Table(data, colWidths=[0.4*inch, 1.3*inch, 0.9*inch, 0.8*inch, 0.7*inch, 0.8*inch, 0.7*inch, 0.5*inch])
table.setStyle(make_table_style())
elements.append(table)

elements.append(Spacer(1, 10))
rs = styles['Normal'].clone('R')
rs.textColor = colors.HexColor('#4a5568')
rs.fontSize = 9
elements.append(Paragraph(
    '<b>Resumen:</b> 5 ventas  |  Completadas: 3  |  Pendientes: 2  |  Ingresos: <b>${:,.0f}</b>'.format(t_gen), rs))
make_footer(elements)

pdf_path = os.path.join(OUT, 'reporte_ventas_ejemplo.pdf')
doc = SimpleDocTemplate(pdf_path, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
doc.build(elements)
print('PDF Ventas:', pdf_path)


# =========================================
# PDF REPORTE FACTURAS
# =========================================
elements2 = []
make_header(elements2, 'Reporte General de Facturas',
            '<b>Generado:</b> ' + datetime.now().strftime('%d/%m/%Y %H:%M'))

facturas = [
    ('FC-000001', 'Carlos Martinez', '1.023.456.789', 500000, 95000, 595000, 'Pagada', '17/09/2026'),
    ('FC-000002', 'Laura Rodriguez', '1.098.765.432', 350000, 66500, 416500, 'Pagada', '17/09/2026'),
    ('FC-000003', 'Andres Lopez', '1.056.789.012', 800000, 152000, 952000, 'Pendiente', '17/09/2026'),
    ('FC-000004', 'Maria Fernandez', '1.034.567.890', 250000, 47500, 297500, 'Pagada', '16/09/2026'),
]

data2 = [['N Factura', 'Cliente', 'Documento', 'Subtotal', 'IVA', 'Total', 'Estado', 'Fecha']]
for f in facturas:
    data2.append([f[0], f[1], f[2],
                  '${:,.0f}'.format(f[3]), '${:,.0f}'.format(f[4]), '${:,.0f}'.format(f[5]),
                  f[6], f[7]])

t_gen2 = sum(f[5] for f in facturas)
data2.append(['', '', '', '', '', '', '', ''])
data2.append(['', '', 'TOTAL', '', '', '${:,.0f}'.format(t_gen2), '', ''])

table2 = Table(data2, colWidths=[0.9*inch, 1.3*inch, 0.8*inch, 0.8*inch, 0.7*inch, 0.8*inch, 0.7*inch, 0.8*inch])
table2.setStyle(make_table_style())
elements2.append(table2)

elements2.append(Spacer(1, 10))
rs2 = styles['Normal'].clone('R2')
rs2.textColor = colors.HexColor('#4a5568')
rs2.fontSize = 9
pagadas = sum(1 for f in facturas if f[6] == 'Pagada')
pendientes = sum(1 for f in facturas if f[6] == 'Pendiente')
elements2.append(Paragraph(
    '<b>Resumen:</b> {} facturas  |  Pagadas: {}  |  Pendientes: {}  |  Total: <b>${:,.0f}</b>'.format(
        len(facturas), pagadas, pendientes, t_gen2), rs2))
make_footer(elements2)

pdf_path2 = os.path.join(OUT, 'reporte_facturas_ejemplo.pdf')
doc2 = SimpleDocTemplate(pdf_path2, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
doc2.build(elements2)
print('PDF Facturas:', pdf_path2)


# =========================================
# EXCEL VENTAS
# =========================================
wb = Workbook()
ws = wb.active
ws.title = 'Reporte de Ventas'

brand_fill = PatternFill(start_color='1a5c59', end_color='1a5c59', fill_type='solid')
gold_fill = PatternFill(start_color='d4a853', end_color='d4a853', fill_type='solid')
alt_fill = PatternFill(start_color='e6f4f1', end_color='e6f4f1', fill_type='solid')
total_fill = PatternFill(start_color='e6f4f1', end_color='e6f4f1', fill_type='solid')
thin = Border(left=Side(style='thin', color='D0D0D0'), right=Side(style='thin', color='D0D0D0'),
              top=Side(style='thin', color='D0D0D0'), bottom=Side(style='thin', color='D0D0D0'))
gold_border = Border(left=Side(style='thin', color='D0D0D0'), right=Side(style='thin', color='D0D0D0'),
                     top=Side(style='medium', color='1a5c59'), bottom=Side(style='double', color='1a5c59'))

ws.merge_cells('A1:K1')
ws.cell(1, 1, 'HORIZONTE VIAJES').font = Font(bold=True, size=16, color='1a5c59', name='Calibri')
ws.row_dimensions[1].height = 30
ws.merge_cells('A2:K2')
ws.cell(2, 1, 'Reporte de Ventas').font = Font(bold=True, size=12, color='1a5c59', name='Calibri')
ws.merge_cells('A3:K3')
ws.cell(3, 1, 'Fecha: 17/09/2026  |  Generado: ' + datetime.now().strftime('%d/%m/%Y %H:%M')).font = Font(italic=True, size=10, color='666666', name='Calibri')
ws.row_dimensions[4].height = 5
ws.cell(4, 1).fill = gold_fill

headers = ['ID', 'Cliente', 'Documento', 'Correo', 'Telefono', 'Subtotal', 'Impuestos', 'Descuento', 'Total', 'Estado', 'Fecha']
for col, h in enumerate(headers, 1):
    c = ws.cell(5, col, h)
    c.fill = brand_fill
    c.font = Font(color='FFFFFF', bold=True, size=11, name='Calibri')
    c.alignment = Alignment(horizontal='center', vertical='center')
    c.border = thin

excel_data = [
    [1, 'Carlos Martinez', '1.023.456.789', 'carlos@test.com', '300-1234567', 500000, 95000, 0, 595000, 'Completada', '17/09/2026 09:15'],
    [2, 'Laura Rodriguez', '1.098.765.432', 'laura@test.com', '301-2345678', 350000, 66500, 0, 416500, 'Completada', '17/09/2026 11:30'],
    [3, 'Andres Lopez', '1.056.789.012', 'andres@test.com', '302-3456789', 800000, 152000, 0, 952000, 'Pendiente', '17/09/2026 14:00'],
    [4, 'Maria Fernandez', '1.034.567.890', 'maria@test.com', '303-4567890', 250000, 47500, 0, 297500, 'Completada', '16/09/2026 16:45'],
    [5, 'Pedro Sanchez', '1.067.890.123', 'pedro@test.com', '304-5678901', 1200000, 228000, 0, 1428000, 'Pendiente', '17/09/2026 18:20'],
]

for r_idx, row_data in enumerate(excel_data):
    for col, val in enumerate(row_data, 1):
        c = ws.cell(6 + r_idx, col, val)
        c.border = thin
        c.alignment = Alignment(horizontal='center', vertical='center')
        c.font = Font(size=10, name='Calibri')
        if r_idx % 2 == 1:
            c.fill = alt_fill

tr = 6 + len(excel_data) + 1
for col_idx, val in zip([5, 6, 7, 8, 9],
                        ['TOTALES',
                         sum(r[5] for r in excel_data),
                         sum(r[6] for r in excel_data),
                         sum(r[7] for r in excel_data),
                         sum(r[8] for r in excel_data)]):
    c = ws.cell(tr, col_idx, val)
    c.font = Font(bold=True, size=11, name='Calibri', color='1a5c59')
    c.border = gold_border
    c.fill = total_fill
    c.alignment = Alignment(horizontal='center')

ws.row_dimensions[tr + 1].height = 5
ws.cell(tr + 1, 1).fill = gold_fill
ws.merge_cells('A{}:K{}'.format(tr + 2, tr + 2))
ws.cell(tr + 2, 1, 'Horizonte Viajes - 5 registros - Ingresos totales: $3,689,000').font = Font(italic=True, size=9, color='999999', name='Calibri')

for ci in range(1, 12):
    ml = max(len(str(ws.cell(r, ci).value or '')) for r in range(5, tr + 1))
    ws.column_dimensions[get_column_letter(ci)].width = min(ml + 4, 28)

xlsx_path = os.path.join(OUT, 'reporte_ventas_ejemplo.xlsx')
wb.save(xlsx_path)
print('Excel Ventas:', xlsx_path)

print('\nArchivos generados. Abrir para verificar el diseno.')
