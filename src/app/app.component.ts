import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductsService } from './products.service';
import { availableColumns } from './categories';
import { Column } from './model';
import { Product } from './products';
import {
  AddEvent,
  CancelEvent,
  EditEvent,
  RemoveEvent,
  SaveEvent,
  GridComponent,
} from '@progress/kendo-angular-grid';

@Component({
  selector: 'my-app',
  template: `
        <kendo-grid
            [kendoGridBinding]="gridData"
            (edit)="editHandler($event)"
            (cancel)="cancelHandler($event)"
            (save)="saveHandler($event)"
            (remove)="removeHandler($event)"
            (add)="addHandler($event)"
            [rowReorderable]="true"
            [reorderable]="true"
            [height]="410"
        >
            <ng-template kendoGridToolbarTemplate>
                <button kendoGridAddCommand>Add new</button>
            </ng-template>
            <kendo-grid-rowreorder-column [width]="40"></kendo-grid-rowreorder-column>
            <kendo-grid-column field="ColumnId" title="Column" [width]="150">
                <ng-template kendoGridEditTemplate let-dataItem="dataItem" let-formGroup="formGroup">
                    <kendo-dropdownlist
                        [defaultItem]="{
                            ColumnId: null,
                            Name: 'Test null item'
                        }"
                        [data]="availableColumns"
                        textField="Name"
                        valueField="ColumnId"
                        [valuePrimitive]="true"
                        [formControl]="formGroup.get('ColumnId')"
                    >
                    </kendo-dropdownlist>
                </ng-template>
                <ng-template kendoGridCellTemplate let-dataItem>
                    <kendo-dropdownlist
                        [data]="availableColumns"
                        textField="Name"
                        valueField="ColumnId"
                        [valuePrimitive]="true"
                        [value]="dataItem.ColumnId"
                        (valueChange)="onValueChange($event, dataItem)"
                    >
                    </kendo-dropdownlist>
                </ng-template>
            </kendo-grid-column>
            
            <kendo-grid-command-column title="command" [width]="220">
                <ng-template kendoGridCellTemplate let-isNew="isNew">
                    
                    <button kendoGridRemoveCommand>Remove</button>
                    <button kendoGridSaveCommand [disabled]="formGroup?.invalid">
                        {{ isNew ? 'Add' : 'Update' }}
                    </button>
                    <button kendoGridCancelCommand>
                        {{ isNew ? 'Discard changes' : 'Cancel' }}
                    </button>
                </ng-template>
            </kendo-grid-command-column>
        </kendo-grid>
    `,
})
export class AppComponent implements OnInit {
  public gridData: Product[];
  public availableColumns: Column[] = availableColumns;
  public formGroup: FormGroup;
  private editedRowIndex: number;

  constructor(private service: ProductsService) {}

  public ngOnInit(): void {
    this.gridData = this.service.products();
  }

  public column(id: number): Column {
    return this.availableColumns.find((x) => x.ColumnId === id);
  }

  public addHandler({ sender }: AddEvent): void {
    this.closeEditor(sender);

    this.formGroup = createFormGroup({
      ColumnId: 1,
    });

    sender.addRow(this.formGroup);
  }

  public editHandler({ sender, rowIndex, dataItem }: EditEvent): void {
    this.closeEditor(sender);

    this.formGroup = createFormGroup(dataItem);

    this.editedRowIndex = rowIndex;

    sender.editRow(rowIndex, this.formGroup);
  }

  public cancelHandler({ sender, rowIndex }: CancelEvent): void {
    this.closeEditor(sender, rowIndex);
  }

  public saveHandler({ sender, rowIndex, formGroup, isNew }: SaveEvent): void {
    const product = formGroup.value;

    this.service.save(product, isNew);

    sender.closeRow(rowIndex);
  }

  public removeHandler({ dataItem }: RemoveEvent): void {
    this.service.remove(dataItem);
  }

  public onValueChange(e, item) {
    item.ColumnId = e;
    this.service.save(item, false);
  }

  private closeEditor(
    grid: GridComponent,
    rowIndex = this.editedRowIndex
  ): void {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }
}

const createFormGroup = (dataItem) =>
  new FormGroup({
    ProductID: new FormControl(dataItem.ProductID),
    ColumnId: new FormControl(dataItem.ColumnId, Validators.required),
  });
