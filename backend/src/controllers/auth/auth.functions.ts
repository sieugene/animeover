// Firebase
import { User, firebaseAuth } from "./../../firebase/index";

export const FirebaseSignUp = (email, password): Promise<User> => {
  return new Promise((resolve, reject) => {
    firebaseAuth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
          resolve(user);
        } else {
          reject({
            message: "required fields are not filled in",
            code: 500,
          });
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        reject({
          message: errorMessage ?? "required fields are not filled in",
          code: errorCode ?? 400,
        });
      });
  });
};

export const FirebaseSignIn = (email, password): Promise<User> => {
  return new Promise((resolve, reject) => {
    firebaseAuth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
          resolve(user);
        } else {
          reject({
            message: "invalid password or email address",
            code: 500,
          });
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        reject({
          message: errorMessage ?? "invalid password or email address",
          code: errorCode ?? 400,
        });
      });
  });
};
