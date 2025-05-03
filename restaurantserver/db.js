import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    
    username : String,
    phonenumber : String,
    email : {type: String, required :true, unique : true},
    password : String,
    profileImage: String,     // for Google Auth
    profilePic: String,       // for uploaded pic
    isGoogleAuth: Boolean

});

const MenuSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    description: { type: String },
    type: { type: String, required: true },});
const CartSchema = new Schema({
     email: { type: String, required: true },
    items: [
            {
                name: { type: String, required: true },
                price: { type: Number, required: true }, 
                quantity: { type: Number, required: true, default: 1 },
                image:{type:String ,required:true} 
            }
        ],
    totalPrice: { type: Number, required: true, default: 0 } // Total cart price
    });
    const orderSchema = new Schema({
        email: { type: String, required: true },
        items: [
          {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true, default: 1 },
            image: { type: String, required: true },
          },
        ],
        totalPrice: { type: Number, required: true, default: 0 },
      
        // ✅ Updated Address Schema
        customerDetails: {
          firstName: { type: String, required: true },
          lastName: { type: String, required: true },
          phoneNumber: { type: String, required: true },
          altPhoneNumber: { type: String, default: "" }, // Optional
          houseNo: { type: String, required: true },
          street: { type: String, required: true },
          landmark: { type: String, default: "" }, // Optional
          district: { type: String, required: true },
          mandal: { type: String, required: true },
          pincode: { type: String, required: true },
          state: { type: String, required: true },
        },
      
        // ✅ Payment Mode with Enum for Validation
        paymentMode: {
          type: String,
          required: true,
          enum: ["Cash", "UPI", "Card"],
        },
      
        orderDate: { type: Date, default: Date.now },
        status: { type: String, required: true, default: "Pending" },
      });
      
      
const FeedbackSchema = new Schema({ 
    email: { type: String, required: true },
    orderId: {type: mongoose.Schema.Types.ObjectId,required: true,ref: "Order",},
    feedback: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    itemName: { type: String, required: true },
}); 
const Categoryschema=new Schema({
    name: { type: String, required: true },
    img: { type: String, required: true },
});
const restaurantSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },  // Make sure this exists
  tableType: { type: String, required: true },
  specialRequests: { type: String },
  phone: { type: String }  ,
  status: { type: String, default: "Pending" }, // Default status
});

const User = mongoose.model('User', UserSchema);
const Menu = mongoose.model('Menu', MenuSchema);
const Cart = mongoose.model("Cart", CartSchema);
const order = mongoose.model("order",orderSchema);
const Feedback = mongoose.model("feedback", FeedbackSchema);
const Category = mongoose.model("Category", Categoryschema);
const Reservation = mongoose.model('Reservation', restaurantSchema);



export {
    User,
    Menu,
    Cart,
    order,
    Feedback,
    Category,
    Reservation,
}

