import {
  AfterViewInit,
  Component,
  effect,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { GroupModel } from '../../../app.models';
import { UserService } from '../../../services/user.service';
import { NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { CreateEditGroupDialogComponent } from '../create-edit-group-dialog/create-edit-group-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatPaginatorModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    NgIf,
    DatePipe,
    MatButtonToggleModule,
    MatChipsModule,
  ],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.css',
})
export class GroupListComponent implements OnInit, AfterViewInit {
  disableExport = false;

  dataSource = new MatTableDataSource<GroupModel>([]);

  remoteData = signal<GroupModel[]>([]);

  searchText = '';

  displayedColumns: string[] = [
    'group_id',
    'group_name',
    'create-date',
    'action',
  ];
  remoteDataLoaded = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  
  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private toastrService: ToastrService,
    private router: Router
  ) {
    effect(() => {
      this.dataSource.data = this.remoteData();
    });
  }

  ngOnInit(): void {
    this.remoteDataLoaded = false;
    this.loadList();
  }
  ngAfterViewInit(): void {
    this.dataSource.filterPredicate = this.customFilter;
    this.dataSource.paginator = this.paginator;
  }
  customFilter = (data: GroupModel, filter: string) => {
    const lowerCaseFilter = filter.toLowerCase();

    return Object.values(data).some((value) => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerCaseFilter);
      }
      return false;
    });
  };

  applyFilter() {
    this.dataSource.filter = this.searchText;
  }
  onDelete(groupId: number) {
    if (
      window.confirm(
        'The group and all its assigned membership will be deleted permanently'
      )
    ) {
      this.remoteDataLoaded = false;
      this.userService.deleteGroup(groupId).subscribe({
        next: (response) => {
          this.remoteDataLoaded = true;
          this.toastrService.success(response?.data);
          //remove item from list
          const newList = [
            ...this.remoteData().filter((item) => item.groupId !== groupId),
          ];
          this.remoteData.set(newList);
        },
        error: () => {
          this.remoteDataLoaded = true;
        },
      });
    }
  }

  onViewGroup(groupId: number) {
    this.router.navigate(['/admin', 'group', 'details', groupId]);
  }
  onEdit(group?: GroupModel) {
    const dialogRef = this.dialog.open(CreateEditGroupDialogComponent, {
      maxWidth: '500px',
      width: '450px',
      data: { group },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === true) {
        //update list
        const oldList = [...this.remoteData()];
        const index = oldList.findIndex(
          (item) => item.groupId === group?.groupId
        );
        if (index !== -1) {
          oldList[index].groupName = result?.groupName;
        } else {
          //we added a new group, reload list
          this.loadList();
          return;
        }
        this.remoteData.set(oldList);
      }
    });
  }

  loadList() {
    this.userService.loadGroupsList().subscribe({
      next: (response) => {
        this.remoteDataLoaded = true;
        this.remoteData.set(response.data!);
      },
      error: () => {
        this.remoteDataLoaded = true;
      },
    });
  }
}
