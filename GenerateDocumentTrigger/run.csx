#r "WindowsBase"
#r "System.IO"
#r "System.IO.Packaging.dll"
#r "DocumentFormat.OpenXml.dll"
using System.Net;
using System.IO;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using System.Collections.Generic;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    log.Info("Generate document from multipart");

    var queryNameValuePairs = req.GetQueryNameValuePairs();
    log.Info("But first, the query parameters");
    foreach (var kvp in queryNameValuePairs)
    {
	log.Info(kvp.Key + " -> " + kvp.Value);
    }

    var streamProvider = new MultipartMemoryStreamProvider();

    await req.Content.ReadAsMultipartAsync(streamProvider);

    foreach (HttpContent ctnt in streamProvider.Contents)
    {
	Stream stream = await ctnt.ReadAsStreamAsync();
	using (SpreadsheetDocument doc = SpreadsheetDocument.Open(stream, false)) {

	    WorkbookPart workbookPart = doc.WorkbookPart;
	    SharedStringTablePart sstpart = workbookPart.GetPartsOfType<SharedStringTablePart>().First();
	    SharedStringTable sst = sstpart.SharedStringTable;

	    WorksheetPart worksheetPart = workbookPart.WorksheetParts.First();
	    Worksheet sheet = worksheetPart.Worksheet;

	    var cells = sheet.Descendants<Cell>();
	    var rows = sheet.Descendants<Row>();

	    Dictionary<string, string> dict = new Dictionary<string, string>();
	    string currentKey = null;

	    // First loop through the cells is just to get the
	    // coordinates of what we want to change afterwards
	    foreach (Cell cell in cells)
	    {
		if ((cell.DataType != null) && (cell.DataType == CellValues.SharedString))
		{
		    int ssid = int.Parse(cell.CellValue.Text);
		    string str = sst.ChildElements[ssid].InnerText;
		    if (!String.IsNullOrEmpty(currentKey))
		    {
			// Store the position where we can replace afterwards
			dict[currentKey] = cell.CellReference;
			currentKey = null;
		    }
		    
		    if (!String.IsNullOrEmpty(str))
		    {
			if (str.IndexOf("Genre de cours", StringComparison.InvariantCultureIgnoreCase) >= 0)
			{
			    currentKey = "genre";
			}
			else if (str.IndexOf("N° de cours", StringComparison.InvariantCultureIgnoreCase) >= 0)
			{
			    currentKey = "numeroDeCours";
			}
			else if (str.IndexOf("Organisation", StringComparison.InvariantCultureIgnoreCase) >= 0 && str.Contains(":"))
			{
			    currentKey = "organisation";
			}
			else if (str.IndexOf("Date", StringComparison.InvariantCultureIgnoreCase) >= 0)
			{
			    currentKey = "date";
			}
			else if (str.IndexOf("Emplacement", StringComparison.InvariantCultureIgnoreCase) >= 0)
			{
			    currentKey = "emplacement";
			}
			else if (str.IndexOf("Etabli par", StringComparison.InvariantCultureIgnoreCase) >= 0 && str.Contains(":"))
			{
			    dict["etabliPar"] = cell.CellReference;
			}
			else if (str.IndexOf("Téléphone", StringComparison.InvariantCultureIgnoreCase) >= 0 && str.Contains(":"))
			{
			    dict["telephone"] = cell.CellReference;
			}
		    }
		}
		else if (cell.CellValue != null)
		{
		    log.Info(string.Format("Cell contents: {0}", cell.CellValue.Text));
		}
	    }
	    return req.CreateResponse(HttpStatusCode.OK, dict);
	}
    }

    return req.CreateResponse(HttpStatusCode.OK, "Read the template file");
}
