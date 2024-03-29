import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/service/auth.service';
import { KindergartenApplicationService } from 'src/app/service/kindergarten-application.service';
import { KindergartenListService } from 'src/app/service/kindergarten-list.service';
import { GroupDetailsComponent } from 'src/app/shared/components/group-details/group-details.component';
import { v4 } from 'uuid';
@Component({
  selector: 'app-group-application',
  templateUrl: './group-application.component.html',
  styleUrls: ['./group-application.component.scss']
})
export class GroupApplicationComponent implements OnInit, OnDestroy {

  constructor(
    private kindergartenApplication: KindergartenApplicationService,
    private route: ActivatedRoute,
    private kindergartenServise: KindergartenListService,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog) { }
  applylists: Array<any> = [];
  activeApplyLists: Array<any> = [];
  archiveApplyLists: Array<any> = [];
  currentApply;
  windowSize: number = window.innerWidth;
  isOpen: boolean;
  isApplicationOpen: boolean;
  applyKindergarten;
  group: string = this.route.snapshot.params.name;
  destroy$ = new Subject<any>();
  searchText: string = '';
  subGroup;
  kindergarten;
  isLoading: boolean;
  ngOnInit(): void {
    this.kindergartenServise.menuPosition.subscribe(
      res => {
        this.isOpen = res;
      }
    )
    const user = JSON.parse(localStorage.getItem('mainuser'));
    this.isLoading = true;
    this.kindergartenApplication.getGroupApplyList(user.kinderId).onSnapshot(
      document => {
        document.forEach(prod => {
          const apply = {
            id: prod.id,
            ...prod.data()
          };
          this.applyKindergarten = apply;
          this.applylists = apply.listOfApply.filter(res => res.groupType.name == this.group);          
          this.activeApplyLists = apply.listOfApply.filter(res => res.groupType.name == this.group && !res.status);
          this.archiveApplyLists = apply.listOfApply.filter(res => res.groupType.name == this.group && res.status)
          this.route.queryParams.subscribe((params) => {
            if (params.hasOwnProperty('applicationId')) {
              this.currentApply = this.applylists.find(item => item.id == params.applicationId)
              this.isApplicationOpen = true;
            }
            else {
              this.currentApply = {};
              this.isApplicationOpen = false;
            }
          })
          this.isLoading = false;
        });
      }
    );
    this.kindergartenApplication.getKinder(user.kinderId).subscribe(res => {
      this.subGroup = res.kindergartenGroup.filter(el => el.name == this.group)[0];
      this.kindergarten = res;
    })

  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowSize = window.innerWidth;
  }

  openApplyDetails(applyDetails, i) {
    this.currentApply = applyDetails;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        applicationId: this.currentApply.id
      }
    })

    if (!applyDetails.isRead) {
      const apply = {
        ...this.applyKindergarten,
        listOfApply: this.applyKindergarten.listOfApply.map(res => {
          if (res.groupType.name == this.group && res.id == applyDetails.id) {
            res.isRead = true;
          }
          return res;
        })
      }
      this.kindergartenApplication.update(this.applyKindergarten.id, apply)
    }

  }

  backToApplyList() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    })
  }


  checkDisplayType(where) {
    if (where == 'applyDetails') {
      if ((this.windowSize < 1020 && !this.isOpen) || this.windowSize < 945) {
        return (this.isApplicationOpen ? 'block' : 'none')
      }
      else {
        return 'block';
      }
    }
    else {
      if ((this.windowSize < 1020 && !this.isOpen) || this.windowSize < 945) {
        return (this.isApplicationOpen ? 'none' : 'block')
      }
      else {
        return 'block';
      }
    }
  }

  changeStatusOfApplication(name) {
    if (name == 'accept' && this.subGroup?.groupDetails?.length) {
      const dialogRef = this.dialog.open(GroupDetailsComponent, {
        data: {
          groupDetails: this.subGroup.groupDetails,
          showMode: 'chooseSubGroop',
          currApplication: this.currentApply
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.kindergarten.kindergartenGroup = this.kindergarten.kindergartenGroup.map(res => {
            if (res.name == this.subGroup.name) {
              res.groupDetails.map(item => {
                if (item.name == this.currentApply.subGroup && this.currentApply.subGroup != result) {
                  item.childrenInGroup -= 1;
                }
                else if (item.name == result && this.currentApply.subGroup != result) {
                  item.childrenInGroup += 1;
                }

                return item;
              })
            }
            return res;

          })
          if (this.currentApply.subGroup != result) {
            console.log('kjhgfghjk', this.kindergarten);
            
            localStorage.setItem('kindergarten', JSON.stringify(this.kindergarten))
            this.kindergartenServise.updateKindergarten(this.kindergarten.id, this.kindergarten)
          }
          this.updateStatus(name, result);
        }
      });
    }
    else {
      this.kindergarten.kindergartenGroup = this.kindergarten.kindergartenGroup.map(res => {
        if (res.name == this.subGroup.name) {
          res.groupDetails.map(item => {
            if (item.name == this.currentApply.subGroup) {
              item.childrenInGroup -= 1;
            }

            return item;
          })
        }
        return res;
      })
      localStorage.setItem('kindergarten', JSON.stringify(this.kindergarten))
      this.kindergartenServise.updateKindergarten(this.kindergarten.id, this.kindergarten)
      this.updateStatus(name)
    }
  }

  updateStatus(status, subGroupName?) {
    const apply = {
      ...this.applyKindergarten,
      listOfApply: this.applyKindergarten.listOfApply.map(res => {
        if (res.groupType.name == this.group && res.id == this.currentApply.id) {
          res.status = status;
          res.subGroup = subGroupName || null;
        }
        return res;
      })
    }
    
    this.kindergartenApplication.update(this.applyKindergarten.id, apply)
  }

  goToUserMessage() {
    this.authService.getAllusers().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      ),
      debounceTime(600),
      takeUntil(this.destroy$)
    ).subscribe(res => {
      const user = res.find(item => item.id == this.currentApply.userId);
      if (user) this.router.navigate(['/agent', `messages`, `${user.id}`])
    })

  }


  getStatistic(name) {
    if (name == 'reviewed') return this.applylists.filter(res => res.isRead).length;
    if (name == 'unreviewed') return this.applylists.filter(res => !res.isRead).length;
    if (name == 'accepted') return this.applylists.filter(res => res.status == 'accept').length;
    if (name == 'declined') return this.applylists.filter(res => res.status == 'decline').length;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
}
