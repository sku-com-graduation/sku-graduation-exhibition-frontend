import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useEffect, useState } from "react";

import { setAuth } from "../store/reducers/auth";
import { postAuth } from "./auth";
import { deleteStudent, getStudent, patchStudent, postStudent } from "./student";
import { deleteAccount, getAccount, resetAccount, postAccount } from "./account";
import { deleteTeams, getProjects, getTeams, patchTeams } from "./team";
import { postGetTeampost } from "./teamPost";

function App() {
  const dispatch = useDispatch();
  const selectedAuth = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    console.log(JSON.stringify(selectedAuth, null, 4));
  }, [selectedAuth]);

  const test = async () => {
    try {
      const user = await postAuth("admin", "admin");
      dispatch(setAuth(user));
    } catch (error) {
      alert(error);
    }
  };

  const [tfile, setTfile] = useState<File>();
  const fileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target?.files?.[0];
    if (f) {
      setTfile(f);
    }
  };
  const submit = async () => {
    try {
      if (tfile) {
        const student = await postStudent(tfile);
        console.log(student);
      } else {
        alert("파일 확인");
      }
    } catch (error) {
      alert(error);
    }
  };

  const getS = async () => {
    const user = await getStudent("2025");
    console.log(user);
  };

  const deleteS = async () => {
    const res = await deleteStudent(["dsV6HlkFfy9S7Zxc+PoTew=="]);
    console.log(res);
  };

  const patchS = async () => {
    const res = await patchStudent([
      {
        encryptedStudentId: "neDFlHrhj19DyoaAHU+4ew==",
        encryptedTeamId: "neDFlHrhj19DyoaAHU+4ew==",
        exhibitionYear: "2025",
        name: "test222",
        role: "LEADER",
        studentNumber: "1234",
      },
    ]);
    console.log(res);
  };

  const [tfile2, setTfile2] = useState<File>();
  const fileChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target?.files?.[0];
    if (f) {
      setTfile2(f);
    }
  };
  const submit2 = async () => {
    try {
      if (tfile2) {
        const student = await postAccount(tfile2);
        console.log(student);
      } else {
        alert("파일 확인");
      }
    } catch (error) {
      alert(error);
    }
  };
  const getA = async () => {
    const account = await getAccount("2025");
    console.log(account);
  };
  const deleteA = async () => {
    const res = await deleteAccount(["+KzLslWur0iQuEVxhaPMlA=="]);
    console.log(res);
  };
  const patchA = async () => {
    const res = await resetAccount(["FndqZ7agxJRjZeE2VMTSzQ=="]);
    console.log(res);
  };

  const getTeam = async () => {
    const res = await getTeams("2025");
    console.log(res);
  };

  const deleteTeam = async () => {
    const res = await deleteTeams({ encryptionTeamIds: ["9If7wadlsJJsuPxYr85v5Q=="] });
    console.log(res);
  };

  const getProject = async () => {
    const res = await getProjects("2025");
    console.log(res);
  };
  const patchTeam = async () => {
    const res = await patchTeams([
      {
        encryptedTeamId: "9If7wadlsJJsuPxYr85v5Q==",
        encryptedprofessorId: "tivTV1S62ssqNFaqD9ErvA==",
        name: "test",
        exhibitionYear: 2025,
        category: "WEB",
      },
    ]);
    console.log(res);
  };

  const [p, setP] = useState<string>("");
  const [ps, setPs] = useState<string[]>();

  const postGetTeamPost = async () => {
    const res = await postGetTeampost(`F/a14FXbJuSBIWqx41g7KQ==`);
    setP(res.teamInfo.posterImage);
    setPs(res.teamInfo.slideImages);

    console.log(res);
  };
  return (
    <>
      <button onClick={test}>test-login</button>
      <input type="file" accept=".csv" onChange={fileChange} />
      <button onClick={submit}>test-student post</button>
      <button onClick={getS}>test-student get</button>
      <button onClick={deleteS}>test-student delete</button>
      <button onClick={patchS}>test-student patch</button>
      <input type="file" accept=".csv" onChange={fileChange2} />
      <button onClick={submit2}>test-account post</button>
      <button onClick={getA}>test-account get</button>
      <button onClick={deleteA}>test-account delete</button>
      <button onClick={patchA}>test-account patch</button>
      <button onClick={getTeam}>test-team get</button>
      <button onClick={deleteTeam}>test-team delete</button>
      <button onClick={patchTeam}>test-team patch</button>
      <button onClick={getProject}>test-projects get</button>
      <button onClick={postGetTeamPost}>postGetTeamPost</button>
      <img src={`data:image/jpeg;base64,${p}`} alt="이미지 들어가야함요" />
      {ps?.map((p) => {
        return <img src={`data:image/jpeg;base64,${p}`} />;
      })}
    </>
  );
}

export default App;
