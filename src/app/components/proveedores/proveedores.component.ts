import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Articulo } from '../../models/articulo';
import { ArticuloFamilia } from '../../models/articulo-familia';
import { MockArticulosService } from '../../services/mock-articulos.service';
import { MockArticulosFamiliasService } from '../../services/mock-articulos-familias.service';
import { ArticulosFamiliasService } from '../../services/articulos-familias.service';
import { ArticulosService } from '../../services/articulos.service';
import { ModalDialogService } from '../../services/modal-dialog.service';

import { Proveedores } from '../../models/proveedores';
import { ProveedoresService } from '../../services/proveedores.service';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {
  Titulo = 'Proveedores';
  TituloAccionABMC = {
    A: '(Alta)',
    B: '(Eliminar)',
    M: '(Modificar)',
    C: '(Consultar)',
    L: '(Listado)'
  };
  AccionABMC = 'L'; // inicialmente inicia en el listado de articulos (buscar con parametros)
  Mensajes = {
    SD: ' No se encontraron registros...',
    RD: ' Revisar los datos ingresados...'
  };

  Items: Proveedores[] = null;
  submitted: boolean = false;

  FormBusqueda: FormGroup;
  FormRegistro: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    private proveedoresService: ProveedoresService,
    private modalDialogService: ModalDialogService
  ) {}

  ngOnInit() {
    this.FormRegistro = this.formBuilder.group({
      PoveedorId: [null],
      ProveedorRazonSocial: [
        null,
        [Validators.required, Validators.maxLength(50)]
      ],
      ProveedorCodigo: [null],
      ProveedorFecha: [
        null,
        [
          Validators.required,
          Validators.pattern(
            '(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}'
          )
        ]
      ]
    });

    this.proveedoresService.get().subscribe((res: Proveedores[]) => {
      this.Items = res;
    });
  }
  Consultar(Dto) {
    this.BuscarPorId(Dto, 'C');
  }

  Eliminar() {}

  Alta() {
    this.AccionABMC = 'A';
    this.FormRegistro.reset({ Activo: true, PoovedorId: 0 });
    this.submitted = false;
    this.FormRegistro.markAsUntouched();
  }

  BuscarPorId(Dto, AccionABMC) {
    window.scroll(0, 0); // ir al incio del scroll

    this.proveedoresService.getById(Dto.ProveedorId).subscribe((res: any) => {
      const itemCopy = { ...res }; // hacemos copia para no modificar el array original del mock

      //formatear fecha de  ISO 8061 a string dd/MM/yyyy
      var arrFecha = itemCopy.ProveedorFecha.substr(0, 10).split('-');
      itemCopy.FechaAlta = arrFecha[2] + '/' + arrFecha[1] + '/' + arrFecha[0];

      this.FormRegistro.patchValue(itemCopy);
      this.AccionABMC = AccionABMC;
    });
  }

  Buscar() {
    this.proveedoresService.get().subscribe((res: any) => {
      this.Items = res;
    });
  }

  Grabar() {
    
    this.submitted = true;
    if (this.FormRegistro.invalid) {
      return;
    }

    //hacemos una copia de los datos del formulario, para modificar la fecha y luego enviarlo al servidor
    const itemCopy = { ...this.FormRegistro.value };

    //convertir fecha de string dd/MM/yyyy a ISO para que la entienda webapi
    var arrFecha = itemCopy.ProveedorFecha.substr(0, 10).split('/');
    if (arrFecha.length == 3)
      itemCopy.ProveedorFecha = new Date(
        arrFecha[2],
        arrFecha[1] - 1,
        arrFecha[0]
      ).toISOString();

    // agregar post
    if (this.AccionABMC == 'A') {
      //this.modalDialogService.BloquearPantalla();
      this.proveedoresService.post(itemCopy).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert('Registro agregado correctamente.');
        this.Buscar();
        //this.modalDialogService.DesbloquearPantalla();
      });
    } else {
      // modificar put
      //this.modalDialogService.BloquearPantalla();
      this.proveedoresService
        .put(itemCopy.PoveedorId, itemCopy)
        .subscribe((res: any) => {
          this.Volver();
          this.modalDialogService.Alert('Registro modificado correctamente.');
          this.Buscar();
          //this.modalDialogService.DesbloquearPantalla();
        });
    }
  }

  Volver() {
    this.AccionABMC = 'L';

    this.proveedoresService.get().subscribe((res: Proveedores[]) => {
      this.Items = res;
    });
  }
}
