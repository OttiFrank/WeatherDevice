using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using case_weatherapp.Models;

namespace case_weatherapp.Controllers
{
    public class HomeController : Controller
    {
        Model model = new Model();
        // GET: Home

        public JsonResult WindList()
        {
            return Json(model.GetWinds());
        }
        public JsonResult TempHumidList()
        {
            return Json(model.GetTempHumid());
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
