using Microsoft.AspNetCore.Mvc;

namespace mockapi.Controllers
{
    [ApiController]
    [Route("[controller]/api")]
    public class ArgoCdController : ControllerBase
    {
        [HttpGet]
        [Route("v1/applications")]
        public IActionResult GetApplications()
        {
            const string response = "{\"metadata\":{},\"items\":[{\"metadata\":{\"name\":\"some-app-1\",\"namespace\":\"argocd\",\"uid\":\"e5159487-0486-4a89-a166-c72b62c8e844\",\"resourceVersion\":\"28417150\",\"generation\":20289,\"creationTimestamp\":\"2020-08-20T13:16:57Z\"}},{\"metadata\":{\"name\":\"some-app-2\",\"namespace\":\"argocd\",\"uid\":\"e5159487-0486-4a89-a166-c72b62c8e844\",\"resourceVersion\":\"28417150\",\"generation\":20289,\"creationTimestamp\":\"2020-08-20T13:16:57Z\"}}]}";
            return Ok(response);
        }
    }
}
