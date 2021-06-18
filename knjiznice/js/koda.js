var baza = 'angelnau';
var baseUrl = 'https://teaching.lavbic.net/api/OIS/baza/' + baza + '/podatki/';

/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */

var pacient1 = {
  id: "4f3a963f-b4ad-4542-a494-e36eb0f5a484",
  ime: "Marshall",
  priimek: "Mathers",
  dataRojstva: "1972-08-17",
  visina: 175,
  teza: 70,
  temperatura: 36,
  simptomi: "Nima",
}

var pacient2 = {
  id: "e29a951b-4307-47d0-a011-12c4679842a9",
  ime: "Tupac",
  priimek: "Shakur",
  dataRojstva: "1971-06-16",
  visina: 170,
  teza: 67,
  temperatura: 38,
  simptomi: "Kašljanje, ne more vonjati",
}

var pacient3 = {
  id: "18058384-8f46-4317-88e2-9e91f67954d7",
  ime: "Jahseh",
  priimek: "Onfroy",
  dataRojstva: "1998-01-23",
  visina: 165,
  teza: 60,
  temperatura: 37,
  simptomi: "Težko dihanje",
}

function generirajPodatke() {
  if($("#preberiPredlogoBolnika option[value='Marshall,Mathers,1972-08-17']").length == 0 && 
    $("#preberiPredlogoBolnika option[value='Tupac,Shakur,1971-06-16']").length == 0 &&
    $("#preberiPredlogoBolnika option[value='Jahseh,Onfroy,1998-01-23']").length == 0) {
    dodajStaticniPacient(pacient1);
    dodajStaticniPacient(pacient2);
    dodajStaticniPacient(pacient3);
    vrniVsi();
  }
}

function dodajStaticniPacient(pacient) {
  $.ajax({
    url: baseUrl + "azuriraj?kljuc=" + pacient.id,
    type: "PUT",
    data: JSON.stringify(pacient),
    contentType: "application/json",
    success: function(){
      console.log("Pacient je bil uspešno dodan!");
    },
    error: function(){
      alert("Pacienta ni bilo mogoče dodati.");
    }
  })
}

function novPacient() {
  var pacient = {
    id: generirajID(),
    ime: $("#kreirajIme").val(),
    priimek: $("#kreirajPriimek").val(),
    dataRojstva: $("#kreirajDatumRojstva").val(),
    visina: null,
    teza: null,
    temperatura: null,
    simptomi: ""
  }
  if(pacient.ime != "" && pacient.priimek != "" && pacient.dataRojstva != "") {
    $.ajax ({
      url: baseUrl + "azuriraj?kljuc=" + pacient.id,
      type:"PUT",
      data: JSON.stringify(pacient),
      contentType: "application/json",
      success: function(){
        console.log("Pacient je bil uspešno dodan!");
        $("#dodanPacient").empty();
        $("#dodanPacient").append("<span style='margin-top:5px' class='label label-success'>Nov bolnik z EHR ID " + pacient.id + " je dodan.</span>");
        vrniEn(pacient.id);
      },
      error: function(){
        alert("Pacienta ni bilo mogoče dodati.");
      }
    })
  } else {
    $("#dodanPacient").empty();
    $("#dodanPacient").append("<span style='margin-top:5px' class='label label-danger'>Vse morate izpolniti.</span>");
  }
}

function vnosMeritve() {
  var ehrID = $("#ehrZaVZ").val()
  $.ajax({
    url: baseUrl + "vrni/" + ehrID,
    type: "GET",
    success: function(pacient) {
      pacient.teza = $("#teza").val();
      pacient.visina = $("#visina").val();
      pacient.simptomi = $("#simptomi").val();
      pacient.temperatura = $("#temperatura").val();
      if(ehrID != "" && (pacient.visina != "" || pacient.teza != "" || pacient.temperatura != "")) {
        $.ajax ({
          url: baseUrl + "azuriraj?kljuc=" + ehrID,
          type:"PUT",
          data: JSON.stringify(pacient),
          contentType: "application/json",
          success: function(){
            console.log("Meritve so bili vspešno dodani!");
            $("#dodajMeritve").empty();
            $("#dodajMeritve").append("<span class='label label-success'>Dodatni podatki o " + pacient.ime + " " + pacient.priimek + " so bili dodani.</span>");
            vrniEn(ehrID);
          },
          error: function(){
            alert("Meritve ni bilo mogoče dodati.");
          }
        })
      } else {
        $("#dodajMeritve").empty();
        $("#dodajMeritve").append("<span class='label label-danger'>Morate napisati EHR ID in VSAJ eno drugo polje.</span>");
      }
    }
  })  
}

function vrniVsi() {
  $.ajax ({
    url: baseUrl + "vrni/vsi",
    type: "GET",
    success: function(odgovor) {
      for(var i in odgovor) {
        var opt1 = document.createElement('option');
        opt1.appendChild(document.createTextNode(odgovor[i].ime + " " + odgovor[i].priimek));
        opt1.value = odgovor[i].ime + "," + odgovor[i].priimek + "," + odgovor[i].dataRojstva;
        document.getElementById("preberiPredlogoBolnika").appendChild(opt1);
        var opt2 = document.createElement('option');
        opt2.appendChild(document.createTextNode(odgovor[i].ime + " " + odgovor[i].priimek));
        opt2.value = odgovor[i].id + "|" + odgovor[i].visina + "|" + odgovor[i].teza + "|" + odgovor[i].temperatura + "|" + odgovor[i].simptomi;
        document.getElementById("vitalniZnaki").appendChild(opt2);
      }
    },
    error: function() {
      alert("Nekaj je šlo narobe.");
    }
  })
}

function izbrisiPacient() {
  var ehrID = $("#preberiEHRid").val();
  izbrisiPacientodSeznam(ehrID);
  $.ajax ({
    url: baseUrl + "brisi?kljuc=" + ehrID,
    type: "DELETE",
    success: function() {
      skrij();
    },
    error: function() {
      alert("Nekaj je šlo narobe.");
    }
  })
}

function vrniEn(id) {
  $.ajax ({
    url: baseUrl + "vrni/" + id,
    type: "GET",
    success: function(odgovor) {
      $("#preberiPredlogoBolnika option[value='" + odgovor.ime + "," + odgovor.priimek + "," + odgovor.dataRojstva + "']").remove();
      $("#vitalniZnaki option[value='" + odgovor.id + "|null|null|null|']").remove();
      var opt1 = document.createElement('option');
      opt1.appendChild(document.createTextNode(odgovor.ime + " " + odgovor.priimek));
      opt1.value = odgovor.ime + "," + odgovor.priimek + "," + odgovor.dataRojstva;
      document.getElementById("preberiPredlogoBolnika").appendChild(opt1);
      var opt2 = document.createElement('option');
      opt2.appendChild(document.createTextNode(odgovor.ime + " " + odgovor.priimek));
      opt2.value = odgovor.id + "|" + odgovor.visina + "|" + odgovor.teza + "|" + odgovor.temperatura + "|" + odgovor.simptomi;
      document.getElementById("vitalniZnaki").appendChild(opt2);
    },
    error: function() {
      alert("Nekaj je šlo narobe.");
    }
  })
}

function izbrisiPacientodSeznam(id) {
  $.ajax ({
    url: baseUrl + "vrni/" + id,
    type: "GET",
    success: function(odgovor) {
      $("#preberiPredlogoBolnika option[value='" + odgovor.ime + "," + odgovor.priimek + "," + odgovor.dataRojstva + "']").remove();
      $("#vitalniZnaki option[value='" + odgovor.id + "|" + odgovor.visina + "|" + odgovor.teza + "|" + odgovor.temperatura + "|" + odgovor.simptomi + "']").remove();
    },
    error: function() {
      alert("Nekaj je šlo narobe.");
    }
  })
}

function preberiEHR() {
  ehrID = $("#preberiEHRid").val();
  if(ehrID != "") {
    $.ajax({
      url: baseUrl + "vrni/" + ehrID,
      type:"GET",
      success: function(odgovor) {
        $("#preberiEHRdiv").empty();
        $("#preberiEHRdiv").append("<table class='table'> \
                                      <thead> \
                                        <th>Pacient</th>  \
                                        <th>" + odgovor.ime + " " + odgovor.priimek + "</th> \
                                      </thead>  \
                                      <tbody> \
                                        <tr> \
                                          <td>Datum Rojstva</td>  \
                                          <td>" + odgovor.dataRojstva + "</td>  \
                                        </tr> \
                                        <tr> \
                                          <td>Visina</td>  \
                                          <td>" + odgovor.visina + " cm</td>  \
                                        </tr> \
                                        <tr> \
                                          <td>Teža</td>  \
                                          <td>" + odgovor.teza + " kg</td>  \
                                        </tr> \
                                        <tr> \
                                          <td>Temperatura</td>  \
                                          <td>" + odgovor.temperatura + " °C</td>  \
                                        </tr> \
                                        <tr> \
                                          <td>Simptomi</td>  \
                                          <td>" + odgovor.simptomi + "</td>  \
                                        </tr> \
                                      </tbody> \
                                    </table> \
                                    <button type='button' class='btn btn-primary btn-sm' onclick='izbrisiPacient()'>Izbriši bolnika</button> \
                                    <button type='button' class='btn btn-primary btn-sm' onclick='skrij()'>Skrij podatke</button> \
        ");
      },
      error: function() {
        alert("EHR ID je napačen, ali pa pacient s tem EHR ID ne obstaja.");
      }
    })
  } else {
    $("#preberiEHRdiv").empty();
        $("#preberiEHRdiv").append("<span class='label label-danger'>Morate napisati EHR ID.</span>");
  }
}

function skrij() {
  $("#preberiEHRdiv").empty();
}

function narisiGraf(drzava) {
  var date = new Date();
  date.setDate(date.getDate() - 1);
  var today = date.toISOString().slice(0, 10)
  date.setDate(date.getDate() - 30);
  var monthAgo = date.toISOString().slice(0,10);
  $.ajax({
    url: "https://api.covid19api.com/country/" + drzava + "?from=" + monthAgo + "&to=" + today,
    type: "GET",
    success: function(podatki) {
      var tabela = [];
      for(var i = 0; i <= 30; i++) {
        tabela.push({
          x: Date.parse(podatki[i].Date),
          y: podatki[i].Active
        })
      }
      var chart = new CanvasJS.Chart("graf", {
        animationEnabled: true,  
        title:{
          text: "Number of active cases in " + drzava,
          fontColor: "#4682B4"
        },
        axisY: {
          title: "Number",
        },
        axisX: {
          text: "Date",
        },
        data: [{
          type: "splineArea",
          color: "rgb(123, 104, 238)",
          markerSize: 5,
          dataPoints: tabela,
          xValueType: "dateTime",
        }]
      });
      chart.render();
    }
  })
}

function DrzavaSelect() {
  narisiGraf($("#selectDrzava").val());
}

function generirajID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

$(document).ready(function() {

  $("#selectDrzava").val("Slovenia");
  narisiGraf("Slovenia");

  $('#preberiPredlogoBolnika').change(function() {
    $("#kreirajSporocilo").html("");
    var podatki = $(this).val().split(",");
    $("#kreirajIme").val(podatki[0]);
    $("#kreirajPriimek").val(podatki[1]);
    $("#kreirajDatumRojstva").val(podatki[2]);
  });
  
  $('#vitalniZnaki').change(function() {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("");
		var podatki = $(this).val().split("|");
		$("#ehrZaVZ").val(podatki[0]);
		$("#visina").val(podatki[1]);
		$("#teza").val(podatki[2]);
		$("#temperatura").val(podatki[3]);
		$("#simptomi").val(podatki[4]);
	});
})
