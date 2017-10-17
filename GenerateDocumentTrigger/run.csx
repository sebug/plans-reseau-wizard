#r "WindowsBase"
#r "System.IO"
#r "System.IO.Packaging.dll"
#r "DocumentFormat.OpenXml.dll"
using System.Net;
using System.IO;
using System.Linq;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using System.Collections.Generic;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    log.Info("Generate document from multipart");

    var qDict = req.GetQueryNameValuePairs().ToDictionary(kvp => kvp.Key,
							  kvp => kvp.Value);

    var streamProvider = new MultipartMemoryStreamProvider();

    await req.Content.ReadAsMultipartAsync(streamProvider);

    Dictionary<string, string> dict = new Dictionary<string, string>();

    foreach (HttpContent ctnt in streamProvider.Contents)
    {
	Stream stream = await ctnt.ReadAsStreamAsync();

	var memoryStream = new MemoryStream();
	byte[] buffer = new byte[1024];
	int len = await stream.ReadAsync(buffer, 0, 1024);
	while (len > 0) {
	    await memoryStream.WriteAsync(buffer, 0, len);
	    len = await stream.ReadAsync(buffer, 0, 1024);
	}
	stream.Close();
	
	using (SpreadsheetDocument doc = SpreadsheetDocument.Open(memoryStream, true)) {

	    WorkbookPart workbookPart = doc.WorkbookPart;
	    SharedStringTablePart sstpart = workbookPart.GetPartsOfType<SharedStringTablePart>().First();
	    SharedStringTable sst = sstpart.SharedStringTable;

	    WorksheetPart worksheetPart = workbookPart.WorksheetParts.First();
	    Worksheet sheet = worksheetPart.Worksheet;

	    var cells = sheet.Descendants<Cell>();
	    var rows = sheet.Descendants<Row>();

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
			dict[cell.CellReference] = currentKey;
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
			    dict[cell.CellReference] = "etabliPar";
			}
			else if (str.IndexOf("Téléphone", StringComparison.InvariantCultureIgnoreCase) >= 0 && str.Contains(":"))
			{
			    dict[cell.CellReference] = "telephone";
			}
		    }
		}
	    }

	    foreach (Cell cell in cells)
	    {
		if ((cell.DataType != null) && (cell.DataType == CellValues.SharedString))
		{
		    if (dict.ContainsKey(cell.CellReference))
		    {
			string k = dict[cell.CellReference];
			if (qDict.ContainsKey(k))
			{
			    string v = qDict[k];
			    int newIdx = InsertSharedStringItem(v, sstpart);
			    cell.CellValue = new CellValue(newIdx.ToString());
			}
			log.Info("Dealt with " + dict[cell.CellReference]);
		    }
		}
	    }

	    var allBytes = memoryStream.ToArray();
	    dict["content"] = Convert.ToBase64String(allBytes);
	    
	    return req.CreateResponse(HttpStatusCode.OK, dict);
	}
    }

    return req.CreateResponse(HttpStatusCode.OK, "Read the template file");
}

public static int InsertSharedStringItem(string text, SharedStringTablePart shareStringPart)
{
    // If the part does not contain a SharedStringTable, create one.
    if (shareStringPart.SharedStringTable == null)
    {
        shareStringPart.SharedStringTable = new SharedStringTable();
    }

    int i = 0;

    // Iterate through all the items in the SharedStringTable. If the text already exists, return its index.
    foreach (SharedStringItem item in shareStringPart.SharedStringTable.Elements<SharedStringItem>())
    {
        if (item.InnerText == text)
        {
            return i;
        }

        i++;
    }

    // The text does not exist in the part. Create the SharedStringItem and return its index.
    shareStringPart.SharedStringTable.AppendChild(new SharedStringItem(new DocumentFormat.OpenXml.Spreadsheet.Text(text)));
    shareStringPart.SharedStringTable.Save();

    return i;
}