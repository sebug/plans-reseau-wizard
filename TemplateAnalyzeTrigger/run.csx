#r "WindowsBase"
#r "System.IO"
#r "System.IO.Packaging"
#r "DocumentFormat.OpenXml.dll"
using System.Net;
using System.IO;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    log.Info("C# HTTP trigger function processed a request.");

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

	    log.Info(string.Format("Row count = {0}", rows.LongCount()));
	    log.Info(string.Format("Cell count = {0}", cells.LongCount()));
	}
	log.Info($"stream length = {stream.Length}");
    }

    return req.CreateResponse(HttpStatusCode.OK, "Read the template file");
}
