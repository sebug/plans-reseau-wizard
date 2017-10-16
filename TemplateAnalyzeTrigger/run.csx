using System.Net;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    log.Info("C# HTTP trigger function processed a request.");

    var streamProvider = new MultipartMemoryStreamProvider();

    req.Content.ReadAsMultipartAsync(streamProvider);

    foreach (HttpContent ctnt in streamProvider.Contents)
    {
	Stream stream = ctnt.ReadAsStreamAsync().Result;
	log.info($"stream length = {stream.Length}");
    }

    return req.CreateResponse(HttpStatusCode.OK, "Read the template file");
}
