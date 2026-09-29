import {Router} from "express";
import sitModel from "../models/sits.model.js";
import bookingModel from "../models/bookings.model.js";
import mongoose from "mongoose";

const router = Router();

router.post("/addSit", async (req, res) => {
  
  const {sitno} = req.body;

  const sit = await sitModel.create({
    sitno
  });
  
  res.status(201).json({
    message: "Sit Created"
  });
})

// router.post("/bookSit", async (req, res) => {

//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     const { sitno, userId } = req.body;

//     // 1. Find the seat and change its status
//     const seat = await sitModel.findOneAndUpdate(
//       {
//         sitno: sitno,
//         sitStatus: "AVAILABLE"
//       },
//       {
//         $set: {
//           sitStatus: "BOOKED"
//         }
//       },
//       {
//         returnDocument: "after",
//         session
//       }
//     );

//     // Seat doesn't exist OR already booked
//     if (!seat) {
//       throw new Error("Seat is already booked or does not exist.");
//     }

//     // 2. Create booking
//     const booking = await bookingModel.create(
//       [
//         {
//           sitno: sitno,
//           userId: userId
//         }
//       ],
//       {
//         session
//       }
//     );

//     // 3. Commit transaction
//     await session.commitTransaction();

//     res.status(201).json({
//       success: true,
//       message: "Seat booked successfully",
//       booking: booking[0]
//     });

//   } catch (error) {

//     // Rollback everything
//     await session.abortTransaction();

//     res.status(400).json({
//       success: false,
//       message: error.message
//     });

//   } finally {
//     session.endSession();
//   }
// })

router.post("/bookSit", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { sitno, userId } = req.body;

    if (!sitno || !userId) {
      return res.status(400).json({
        success: false,
        message: "sitno and userId are required"
      });
    }

    session.startTransaction();

    // 1. Atomically find an AVAILABLE seat and mark it BOOKED
    const seat = await sitModel.findOneAndUpdate(
      {
        sitno: sitno,
        sitStatus: "AVAILABLE"
      },
      {
        $set: {
          sitStatus: "BOOKED"
        }
      },
      {
        returnDocument: "after",
        session
      }
    );

    // Seat does not exist OR is already booked
    if (!seat) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message: `Seat ${sitno} is already booked or does not exist.`
      });
    }

    // 2. Create booking
    const booking = await bookingModel.create(
      [
        {
          sitno: sitno,
          userId: userId
        }
      ],
      {
        session
      }
    );

    // 3. Commit transaction
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: `Seat ${sitno} booked successfully`,
      booking: booking[0]
    });

  } catch (error) {

    // Abort only if transaction is still active
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Booking error:", error);

    /*
     * MongoDB write conflict
     */
    if (
      error.code === 112 ||
      error.codeName === "WriteConflict" ||
      error.message?.includes("Write conflict")
    ) {
      return res.status(409).json({
        success: false,
        message: `Seat ${req.body.sitno} is currently being booked by another request. Please try again.`
      });
    }

    /*
     * Unexpected error
     */
    return res.status(500).json({
      success: false,
      message: "Unable to book the seat due to a server error."
    });

  } finally {
    await session.endSession();
  }
});


router.post("/test-api", async(req, res) => {
  try {
    const { sitno, totalRequests = 20 } = req.body;

    const requests = [];

    for (let i = 1; i <= totalRequests; i++) {
      requests.push(
        fetch("http://localhost:3000/api/bookSit", {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            sitno: sitno,
            userId: `test-user-${i}`
          })
        }).then(async (response) => {

          const data = await response.json();

          return {
            request: i,
            status: response.status,
            response: data
          };

        }).catch((error) => {

          return {
            request: i,
            status: "ERROR",
            error: error.message
          };

        })
      );
    }

    // Send all requests concurrently
    const results = await Promise.all(requests);

    const successful = results.filter(
      result => result.status === 201
    );

    const failed = results.filter(
      result => result.status === 409
    );

    res.status(200).json({
      success: true,
      totalRequests: results.length,
      successfulBookings: successful.length,
      failedBookings: failed.length,
      results: results
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
})

export default router;