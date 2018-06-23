import { Component,Pipe } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'

})
@Pipe({ name: 'order-by' })
export class HomePage {
  private http: any;
  private browserLang: string;
  private elementsList:any;
  constructor(public navCtrl: NavController, public translate: TranslateService, http: HttpClient,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController,
    private geolocation: Geolocation) {
    this.http = http;
    // used to set the default language for multi language support
    //OPCIONAL SI SE DEJA CARGA MAS RAPIDO EL IDIOMA
    this.browserLang = translate.getBrowserLang();
    translate.use(this.browserLang.match(/en|es/) ? this.browserLang : 'es');

  }
  ionViewDidLoad() {
    this.getData();
  }

  getData() {
    let loading;
    this.translate.get('PLEASE_WAIT').subscribe(
      value => {
        // value is our translated string
        loading = this.loadingCtrl.create({
          content: value,
          dismissOnPageChange: true
        });
        loading.present();
      }
    );

    this.geolocation.getCurrentPosition().then((resp) => {
      loading.present();
      let headers = new HttpHeaders({ "Content-Language": this.browserLang, "apiKey": "a5fcd0fa781a793183dcb66c12978a47" });
      this.http.get('https://beta.econduce.mx/api/estaciones/get_nearest_map_features.json?latitude=' + resp.coords.latitude + '&longitude=' + resp.coords.longitude,
        { headers }
      ).subscribe(data => {   // data is already a JSON object
        loading.dismiss();
        this.elementsList=data;
        this.elementsList.sort((a, b) => {
          if (a.item.properties.distance < b.item.properties.distance && a.item.properties.range < b.item.properties.range) return -1;
          else if (a.item.properties.distance > b.item.properties.distance && a.item.properties.range > b.item.properties.range) return 1;
          else return 0;
        });
      }, error => {
        loading.dismiss();
      });
    }).catch((error) => {
      loading.dismiss();
      this.translate.get('ACCEPT').subscribe(accept => {
        this.translate.get('ERROR').subscribe(text => {
          let alert = this.alertCtrl.create({
            title: text,
            buttons: [accept]
          });
          alert.present();
        });
      });
    });

  }
}
