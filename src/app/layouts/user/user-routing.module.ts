import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactComponent } from 'src/app/shared/components/contact/contact.component';
import { UserProfileComponent } from 'src/app/shared/components/user-profile/user-profile.component';
import { KindergartenListComponent } from './kindergarten-list/kindergarten-list.component';
import { MainPageComponent } from './main-page/main-page.component';
import { UserComponent } from './user.component';


const routes: Routes = [
    {
        path: '',
        component: UserComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'main-page'
            },
            {
                path: 'main-page',
                component: MainPageComponent
            },
            {
                path: 'kindergarten-list',
                loadChildren: () => import('./kindergarten-list/kindergarten-list.module').then((m) => m.KindergartenListModule)
            },
            {
                path: 'messages',
                loadChildren: () => import('./messages/messages.module').then((m) => m.MessagesModule)
            },
            {
                path: 'profile',
                component: UserProfileComponent
            },
            {
                path: 'contact',
                component: ContactComponent
            },
            {
                path: "**",
                redirectTo: "main-page"
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule { }