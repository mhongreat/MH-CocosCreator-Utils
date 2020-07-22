
const { ccclass, property } = cc._decorator;

class A {
    public a: number = 1;
}

class B extends A {
    public b: number = 2;
}

class C extends A {
    public c: number = 3;
}

@ccclass
export default class NewClass extends cc.Component {

    start() {
        // console.log(this.getUI("NewClass"));
        // // console.log(this.getUI(C));


    }



}
