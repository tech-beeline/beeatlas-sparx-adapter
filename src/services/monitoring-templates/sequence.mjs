export default function Sequence() {
    let id = 1;
    this.next = () => {
        return id++;
    }
    return this;
}